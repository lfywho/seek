document.addEventListener('DOMContentLoaded', function () {
	var feedContainer = document.getElementById('feedContainer');
	var modal = document.getElementById('postModal');
	var modalTitle = document.getElementById('modalPostTitulo');
	var modalAuthorName = document.getElementById('modalAuthorName');
	var modalAuthorAvatar = document.getElementById('modalAuthorAvatar');
	var modalGallery = document.getElementById('modalGallery');
	var modalSidebarAuthorName = document.getElementById('modalSidebarAuthorName');
	var modalSidebarAuthorAvatar = document.getElementById('modalSidebarAuthorAvatar');
	var modalSidebarGallery = document.getElementById('modalSidebarGallery');
	var modalSidebarProjects = document.getElementById('modalSidebarProjects');
	var modalLikeButton = document.getElementById('modalLike');
	var modalFavoriteButton = document.getElementById('modalFavorite');
	var modalShareButton = document.getElementById('modalShare');
	var modalInfoButton = document.getElementById('modalInfo');
	var modalCommentsButton = document.getElementById('modalComments');
	var modalCloseButton = document.querySelector('.post-modal__close');
	var modalOverlay = document.querySelector('.post-modal__overlay');
	var modalScrollUpButton = document.getElementById('modalScrollUp');
	var modalScrollDownButton = document.getElementById('modalScrollDown');
	var modalHeader = document.querySelector('.post-modal__header');
	var modalCommentsSection = document.querySelector('.post-modal__comments');
	var commentsList = document.getElementById('commentsList');
	var commentInput = document.getElementById('commentInput');
	var sendCommentButton = document.getElementById('sendComment');
	var replyTarget = document.getElementById('replyTarget');
	var replyTargetText = document.getElementById('replyTargetText');
	var cancelReplyButton = document.getElementById('cancelReply');
	var loggedUser = typeof getUsuarioLogado === 'function' ? getUsuarioLogado() : null;
	var postsCache = [];
	var postsById = {};
	var postState = {};
	var POST_ID_QUERY_KEY = 'postId';
	var replyState = null;

	// O modal pode ser reutilizado em outras páginas (ex.: perfil) que nao tem feed.
	if (!modal || !modalTitle || !modalAuthorName || !modalAuthorAvatar || !modalGallery || !modalLikeButton || !modalFavoriteButton || !modalShareButton || !modalCloseButton || !modalOverlay) {
		return;
	}

	function rememberPost(post) {
		if (!post || post.id == null) {
			return;
		}

		var numericId = Number(post.id);
		if (!numericId) {
			return;
		}

		postsById[numericId] = post;
		for (var index = 0; index < postsCache.length; index += 1) {
			if (Number(postsCache[index].id) === numericId) {
				return;
			}
		}
		postsCache.push(post);
	}

	function getCurrentUserName() {
		if (loggedUser && loggedUser.nome) {
			return loggedUser.nome;
		}
		return 'Você';
	}

	function hideReplyTarget() {
		replyState = null;
		if (!replyTarget) {
			return;
		}
		replyTarget.hidden = true;
		if (replyTargetText) {
			replyTargetText.textContent = '';
		}
		if (commentInput) {
			commentInput.placeholder = 'Adicione um comentário...';
		}
	}

	function showReplyTarget(commentId, userName) {
		replyState = commentId;
		if (!replyTarget) {
			return;
		}
		if (replyTargetText) {
			replyTargetText.textContent = 'Respondendo ' + userName;
		}
		replyTarget.hidden = false;
		if (commentInput) {
			commentInput.placeholder = 'Escreva sua resposta...';
			commentInput.focus();
		}
	}

	function openUserProfile(userId) {
		if (!userId) {
			return;
		}

		window.location.href = 'usuario.html?id=' + encodeURIComponent(userId);
	}

	function normalizeComment(comment) {
		var replies = Array.isArray(comment && (comment.respostas || comment.replies))
			? (comment.respostas || comment.replies)
			: [];

		return {
			id: comment && comment.id != null ? comment.id : 'c-' + Date.now(),
			userId: comment && comment.user_id != null ? comment.user_id : comment && comment.userId != null ? comment.userId : '',
			user: comment && comment.nome ? comment.nome : comment && comment.user ? comment.user : 'Usuário',
			photo: comment && comment.foto ? comment.foto : comment && comment.photo ? comment.photo : 'img/userProfile.png',
			text: comment && comment.comentario ? comment.comentario : comment && comment.text ? comment.text : '',
			replies: replies.map(normalizeComment)
		};
	}

	function makeProfileTrigger(element, userId, userName) {
		if (!element || !userId) {
			return;
		}

		element.style.cursor = 'pointer';
		element.setAttribute('role', 'link');
		element.setAttribute('tabindex', '0');
		element.setAttribute('aria-label', 'Abrir perfil de ' + (userName || 'usuário'));
		element.addEventListener('click', function () {
			openUserProfile(userId);
		});
		element.addEventListener('keydown', function (event) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				openUserProfile(userId);
			}
		});
	}

	function createCommentNode(comment, isReply) {
		var wrapper = document.createElement('div');
		wrapper.className = isReply ? 'post-modal__reply' : 'post-modal__comment';

		var row = document.createElement('div');
		row.className = 'post-modal__comment-row';

		var avatar = document.createElement('div');
		avatar.className = 'post-modal__comment-avatar';
		avatar.setAttribute('aria-hidden', 'true');
		if (comment.photo) {
			avatar.style.backgroundImage = 'url("' + String(comment.photo).replace(/"/g, '\\"') + '")';
			avatar.style.backgroundSize = 'cover';
			avatar.style.backgroundPosition = 'center';
			avatar.style.backgroundRepeat = 'no-repeat';
		}

		var body = document.createElement('div');
		body.className = 'post-modal__comment-body';

		var user = document.createElement('div');
		user.className = 'post-modal__comment-user';
		user.textContent = comment.user || 'Usuário';

		var text = document.createElement('div');
		text.className = 'post-modal__comment-text';
		text.textContent = comment.text || '';

		makeProfileTrigger(avatar, comment.userId, comment.user);
		makeProfileTrigger(user, comment.userId, comment.user);

		var replyBtn = document.createElement('button');
		replyBtn.type = 'button';
		replyBtn.className = 'post-modal__comment-reply';
		replyBtn.textContent = 'Responder';
		replyBtn.addEventListener('click', function () {
			showReplyTarget(comment.id, comment.user || 'Usuário');
		});

		body.appendChild(user);
		body.appendChild(text);
		body.appendChild(replyBtn);

		row.appendChild(avatar);
		row.appendChild(body);
		wrapper.appendChild(row);

		if (Array.isArray(comment.replies) && comment.replies.length) {
			var repliesWrapper = document.createElement('div');
			repliesWrapper.className = 'post-modal__replies';

			comment.replies.forEach(function (reply) {
				repliesWrapper.appendChild(createCommentNode(reply, true));
			});

			wrapper.appendChild(repliesWrapper);
		}

		return wrapper;
	}

	function renderComments(postId) {
		if (!commentsList) {
			return;
		}

		var state = postState[postId];
		if (!state) {
			commentsList.innerHTML = '';
			return;
		}

		if (state.commentsLoading) {
			commentsList.innerHTML = '<p class="post-modal__comments-empty">Carregando comentários...</p>';
			return;
		}

		if (state.commentsError) {
			commentsList.innerHTML = '<p class="post-modal__comments-empty">' + state.commentsError + '</p>';
			return;
		}

		var comments = Array.isArray(state.comments) ? state.comments : [];
		commentsList.innerHTML = '';

		if (!comments.length) {
			var empty = document.createElement('p');
			empty.className = 'post-modal__comments-empty';
			empty.textContent = 'Nenhum comentário ainda';
			commentsList.appendChild(empty);
			return;
		}

		comments.forEach(function (comment) {
			commentsList.appendChild(createCommentNode(comment, false));
		});
	}

	async function loadComments(postId) {
		var state = postState[postId];
		if (!state) {
			return;
		}

		state.commentsLoading = true;
		state.commentsError = '';
		renderComments(postId);

		try {
			var response = await fetch(ip_api + '/comentarios/' + encodeURIComponent(postId));
			if (!response.ok) {
				throw new Error('Falha ao carregar comentarios');
			}

			var data = await response.json();
			state.comments = Array.isArray(data) ? data.map(normalizeComment) : [];
		} catch (error) {
			state.comments = [];
			state.commentsError = 'Nao foi possivel carregar os comentarios.';
		} finally {
			state.commentsLoading = false;
			renderComments(postId);
		}
	}

	async function submitComment(postId, rawText) {
		var state = postState[postId];
		if (!state) {
			return;
		}

		var text = (rawText || '').trim();
		if (!text || !loggedUser || !loggedUser.id) {
			return;
		}

		var endpoint = replyState
			? '/comentarios/' + encodeURIComponent(postId) + '/responder/' + encodeURIComponent(replyState)
			: '/comentarios/' + encodeURIComponent(postId);

		var response = await fetch(ip_api + endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				idusuario: String(loggedUser.id),
				conteudo: text
			})
		});

		if (!response.ok) {
			throw new Error('Falha ao enviar comentario');
		}

		hideReplyTarget();
		if (commentInput) {
			commentInput.value = '';
		}

		await loadComments(postId);
	}

	function formatDate(value) {
		if (!value) {
			return '';
		}

		var date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return '';
		}

		return date.toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	function getRelativeTime(value) {
		if (!value) {
			return '';
		}

		var date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return '';
		}

		var diffMs = Date.now() - date.getTime();
		if (diffMs < 0) {
			diffMs = 0;
		}

		var seconds = Math.floor(diffMs / 1000);
		if (seconds < 60) {
			return 'agora mesmo';
		}

		var minutes = Math.floor(seconds / 60);
		if (minutes < 60) {
			return minutes === 1 ? 'há 1 minuto' : 'há ' + minutes + ' minutos';
		}

		var hours = Math.floor(minutes / 60);
		if (hours < 24) {
			return hours === 1 ? 'há 1 hora' : 'há ' + hours + ' horas';
		}

		var days = Math.floor(hours / 24);
		if (days < 30) {
			return days === 1 ? 'há 1 dia' : 'há ' + days + ' dias';
		}

		var months = Math.floor(days / 30);
		if (months < 12) {
			return months === 1 ? 'há 1 mês' : 'há ' + months + ' meses';
		}

		var years = Math.floor(months / 12);
		return years === 1 ? 'há 1 ano' : 'há ' + years + ' anos';
	}

	function getPostImage(post) {
		if (Array.isArray(post.imagens) && post.imagens.length > 0) {
			return post.imagens[0];
		}

		return 'img/logo.png';
	}

	function getPostImages(post) {
		if (Array.isArray(post.imagens) && post.imagens.length > 0) {
			return post.imagens.filter(Boolean);
		}

		return [getPostImage(post)];
	}

	function getPostAuthor(post) {
		return post.user && post.user.nome ? post.user.nome : 'Usuário';
	}

	function getPostAuthorPhoto(post) {
		return post.user && post.user.foto ? post.user.foto : 'img/userProfile.png';
	}

	function getPostIdFromUrl() {
		var params = new URLSearchParams(window.location.search);
		var rawValue = params.get(POST_ID_QUERY_KEY);
		if (!rawValue) {
			return null;
		}

		var parsed = Number(rawValue);
		if (!Number.isInteger(parsed) || parsed <= 0) {
			return null;
		}

		return parsed;
	}

	function setPostIdInUrl(postId) {
		var url = new URL(window.location.href);
		url.searchParams.set(POST_ID_QUERY_KEY, String(postId));
		history.replaceState({}, '', url);
	}

	function clearPostIdFromUrl() {
		var url = new URL(window.location.href);
		url.searchParams.delete(POST_ID_QUERY_KEY);
		history.replaceState({}, '', url);
	}

	function getCurrentPostShareUrl() {
		var postId = Number(modal.dataset.currentPostId);
		if (!postId) {
			return window.location.href;
		}

		var shareUrl = new URL(window.location.href);
		shareUrl.searchParams.set(POST_ID_QUERY_KEY, String(postId));
		return shareUrl.toString();
	}

	function createGalleryTile(src, altText) {
		var figure = document.createElement('figure');
		figure.className = 'post-modal__tile';

		var image = document.createElement('img');
		image.src = src;
		image.alt = altText;

		figure.appendChild(image);
		return figure;
	}

	function createSidebarThumb(src, altText) {
		var thumb = document.createElement('div');
		thumb.className = 'post-modal__sidebar-thumb';

		if (src) {
			var image = document.createElement('img');
			image.src = src;
			image.alt = altText || '';
			thumb.appendChild(image);
		}

		return thumb;
	}

	function renderSidebarThumbs(container, images, titlePrefix) {
		if (!container) {
			return;
		}

		var list = Array.isArray(images) ? images.filter(Boolean) : [];
		container.innerHTML = '';

		var max = 3;
		for (var index = 0; index < max; index += 1) {
			var src = list[index] || '';
			container.appendChild(createSidebarThumb(src, (titlePrefix || 'Imagem') + ' ' + (index + 1)));
		}
	}

	function renderGallery(post) {
		var images = getPostImages(post);

		if (!images.length) {
			images = ['img/logo.png'];
		}

		modalGallery.dataset.count = String(images.length);
		modalGallery.innerHTML = '';

		for (var index = 0; index < images.length; index += 1) {
			modalGallery.appendChild(createGalleryTile(images[index], (post.titulo || 'Projeto') + ' - imagem ' + (index + 1)));
		}

		renderSidebarThumbs(modalSidebarGallery, images, 'Galeria');
		renderSidebarThumbs(modalSidebarProjects, images, 'Projeto');
	}

	function setModalContent(post) {
		modal.dataset.currentPostId = String(post.id);
		modalTitle.textContent = post.titulo || 'Projeto';
		modalAuthorName.textContent = getPostAuthor(post);
		modalAuthorAvatar.src = getPostAuthorPhoto(post);
		modalAuthorAvatar.alt = getPostAuthor(post);
		if (modalSidebarAuthorName) {
			modalSidebarAuthorName.textContent = getPostAuthor(post);
		}
		if (modalSidebarAuthorAvatar) {
			modalSidebarAuthorAvatar.src = getPostAuthorPhoto(post);
			modalSidebarAuthorAvatar.alt = getPostAuthor(post);
		}
		renderGallery(post);
	}

	function updateLikeButton(postId) {
		var state = postState[postId];
		if (!state) {
			return;
		}

		modalLikeButton.classList.toggle('active', !!state.liked);
		modalLikeButton.setAttribute('aria-pressed', state.liked ? 'true' : 'false');
		modalLikeButton.title = state.totalLikes + ' curtidas';
	}

	function updateFavoriteButton(postId) {
		var state = postState[postId];
		if (!state) {
			return;
		}

		modalFavoriteButton.classList.toggle('active', !!state.favorite);
		modalFavoriteButton.setAttribute('aria-pressed', state.favorite ? 'true' : 'false');
	}

	function renderCard(post) {
		var article = document.createElement('article');
		article.className = 'feedCard';
		article.tabIndex = 0;
		article.dataset.postId = String(post.id);

		var body = document.createElement('div');
		body.className = 'feedImg';

		var image = document.createElement('img');
		image.src = getPostImage(post);
		image.alt = post.titulo || 'Post';
		body.appendChild(image);

		var info = document.createElement('div');
		info.className = 'infoPost';

		var left = document.createElement('div');
		left.className = 'feedInfoLeft';

		var title = document.createElement('span');
		title.className = 'feedPostTitle';
		title.textContent = post.titulo || 'Sem título';

		var logoName = document.createElement('div');
		logoName.className = 'logoName';

		var avatar = document.createElement('img');
		avatar.className = 'logoUser';
		avatar.src = getPostAuthorPhoto(post);
		avatar.alt = getPostAuthor(post);

		var author = document.createElement('span');
		author.className = 'userName';
		author.textContent = getPostAuthor(post);

		logoName.appendChild(avatar);
		logoName.appendChild(author);

		left.appendChild(title);
		left.appendChild(logoName);

		var likeView = document.createElement('div');
		likeView.className = 'likeView';

		var postTime = document.createElement('span');
		postTime.className = 'feedPostTime';
		postTime.textContent = getRelativeTime(post.criado_em) || formatDate(post.criado_em);

		likeView.appendChild(postTime);

		info.appendChild(left);
		info.appendChild(likeView);

		article.appendChild(body);
		article.appendChild(info);

		article.addEventListener('click', function () {
			openPost(post);
		});

		article.addEventListener('keydown', function (event) {
			if (event.key === 'Enter') {
				openPost(post);
			}
		});

		return article;
	}

	function renderFeed(posts) {
		feedContainer.innerHTML = '';

		if (!posts.length) {
			feedContainer.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#777;padding:20px 0;">Nenhum post encontrado.</p>';
			return;
		}

		posts.forEach(function (post) {
			feedContainer.appendChild(renderCard(post));
		});
	}

	function openModal() {
		modal.hidden = false;
		document.body.style.overflow = 'hidden';
		modal.scrollTop = 0;
	}

	function closeModal() {
		modal.hidden = true;
		document.body.style.overflow = '';
		hideReplyTarget();
		if (commentInput) {
			commentInput.value = '';
		}
		clearPostIdFromUrl();
	}

	async function loadLikeStatus(postId) {
		if (!loggedUser || !loggedUser.id) {
			return false;
		}

		var response = await fetch(ip_api + '/posts/verifica-like/' + loggedUser.id + '/' + postId);
		if (!response.ok) {
			return false;
		}

		return response.json();
	}

	async function loadLikeCount(postId) {
		var response = await fetch(ip_api + '/posts/likes/' + postId);
		if (!response.ok) {
			return 0;
		}

		var data = await response.json();
		return Array.isArray(data) && data[0] ? Number(data[0].total_likes) || 0 : 0;
	}

	async function openPost(post, options) {
		rememberPost(post);

		var config = options || {};
		var shouldSyncUrl = config.syncUrl !== false;

		if (shouldSyncUrl) {
			setPostIdInUrl(post.id);
		}

		setModalContent(post);

		if (!postState[post.id]) {
			postState[post.id] = {
				liked: false,
				favorite: false,
				totalLikes: Number(post.total_likes) || 0,
				comments: [],
				commentsLoading: false,
				commentsError: ''
			};
		}
		if (!Array.isArray(postState[post.id].comments)) {
			postState[post.id].comments = [];
		}

		hideReplyTarget();
		if (commentInput) {
			commentInput.value = '';
		}

		openModal();
		modalLikeButton.disabled = !loggedUser;
		if (sendCommentButton) {
			sendCommentButton.disabled = !loggedUser || !loggedUser.id;
		}
		await loadComments(post.id);

		try {
			postState[post.id].liked = !!(await loadLikeStatus(post.id));
			postState[post.id].totalLikes = await loadLikeCount(post.id) || postState[post.id].totalLikes;
			updateLikeButton(post.id);
			updateFavoriteButton(post.id);
		} catch (error) {
			updateLikeButton(post.id);
			updateFavoriteButton(post.id);
		}
	}

	if (sendCommentButton && commentInput) {
		sendCommentButton.addEventListener('click', async function () {
			var postId = Number(modal.dataset.currentPostId);
			if (!postId) {
				return;
			}

			try {
				await submitComment(postId, commentInput.value);
			} catch (error) {
				alert('Nao foi possivel enviar o comentario.');
			}
		});

		commentInput.addEventListener('keydown', function (event) {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				sendCommentButton.click();
			}
		});
	}

	if (cancelReplyButton) {
		cancelReplyButton.addEventListener('click', function () {
			hideReplyTarget();
		});
	}

	async function openPostFromUrlIfPresent() {
		var postIdFromUrl = getPostIdFromUrl();
		if (!postIdFromUrl) {
			return;
		}

		var targetPost = postsCache.find(function (post) {
			return Number(post.id) === postIdFromUrl;
		});

		if (!targetPost) {
			clearPostIdFromUrl();
			return;
		}

		await openPost(targetPost, { syncUrl: false });
	}

	async function toggleLike() {
		var postId = Number(modal.dataset.currentPostId);
		var state = postState[postId];

		if (!state || !loggedUser || !loggedUser.id) {
			return;
		}

		var response = await fetch(ip_api + '/posts/like', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				userId: loggedUser.id,
				postId: postId
			})
		});

		if (!response.ok) {
			return;
		}

		var data = await response.json();
		state.liked = !!data.liked;
		state.totalLikes = await loadLikeCount(postId) || state.totalLikes;
		updateLikeButton(postId);
	}

	async function shareCurrentPost() {
		var postId = Number(modal.dataset.currentPostId);
		if (!postId) {
			return;
		}

		var post = postsById[postId] || postsCache.find(function (item) {
			return Number(item.id) === postId;
		});

		var shareUrl = getCurrentPostShareUrl();
		var shareTitle = post && post.titulo ? post.titulo : 'Post no Seek';

		if (navigator.share) {
			try {
				await navigator.share({
					title: shareTitle,
					url: shareUrl
				});
				return;
			} catch (error) {
				if (error && error.name === 'AbortError') {
					return;
				}
			}
		}

		if (navigator.clipboard && navigator.clipboard.writeText) {
			try {
				await navigator.clipboard.writeText(shareUrl);
				alert('Link do post copiado para a area de transferencia.');
				return;
			} catch (error) {
				// fallback handled below
			}
		}

		alert('Nao foi possivel compartilhar automaticamente. Copie este link: ' + shareUrl);
	}

	async function loadPosts() {
		feedContainer.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#777;padding:20px 0;">Carregando posts...</p>';

		try {
			var response = await fetch(ip_api + '/posts');
			if (!response.ok) {
				throw new Error('Falha ao carregar posts');
			}

			postsCache = await response.json();
			postsById = {};
			postsCache.forEach(function (post) {
				rememberPost(post);
			});
			renderFeed(postsCache);
			await openPostFromUrlIfPresent();
		} catch (error) {
			feedContainer.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#b32929;padding:20px 0;">Nao foi possivel carregar os posts.</p>';
		}
	}

	modalLikeButton.addEventListener('click', function () {
		toggleLike();
	});

	modalFavoriteButton.addEventListener('click', function () {
		var postId = Number(modal.dataset.currentPostId);
		if (!postState[postId]) {
			return;
		}

		postState[postId].favorite = !postState[postId].favorite;
		updateFavoriteButton(postId);
	});

	modalShareButton.addEventListener('click', function () {
		shareCurrentPost();
	});

	if (modalInfoButton) {
		modalInfoButton.addEventListener('click', function () {
			var postId = Number(modal.dataset.currentPostId);
			var post = postsById[postId] || postsCache.find(function (item) {
				return Number(item.id) === postId;
			});

			if (!post) {
				return;
			}

			alert(post.legenda || 'Sem descricao para este projeto.');
		});
	}

	if (modalCommentsButton) {
		modalCommentsButton.addEventListener('click', function () {
			var postId = Number(modal.dataset.currentPostId);
			var post = postsById[postId] || postsCache.find(function (item) {
				return Number(item.id) === postId;
			});

			if (!post) {
				return;
			}

			var created = getRelativeTime(post.criado_em) || formatDate(post.criado_em) || 'data indisponivel';
			alert('Publicado ' + created + '.');
		});
	}

	modalCloseButton.addEventListener('click', closeModal);
	modalOverlay.addEventListener('click', closeModal);

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && !modal.hidden) {
			closeModal();
		}
	});

	function scrollModalToElement(targetElement) {
		if (!targetElement) {
			return;
		}

		var modalRect = modal.getBoundingClientRect();
		var targetRect = targetElement.getBoundingClientRect();
		var targetTop = targetRect.top - modalRect.top + modal.scrollTop;
		modal.scrollTo({
			top: Math.max(0, targetTop),
			behavior: 'smooth'
		});
	}

	if (modalScrollUpButton) {
		modalScrollUpButton.addEventListener('click', function () {
			scrollModalToElement(modalHeader || modal);
		});
	}

	if (modalScrollDownButton) {
		modalScrollDownButton.addEventListener('click', function () {
			scrollModalToElement(modalCommentsSection || commentsList);
		});
	}

	// Exposto para outras paginas (ex.: usuario.html) reutilizarem o mesmo modal.
	window.seekOpenPostModal = function (post, options) {
		return openPost(post, options);
	};

	if (feedContainer) {
		loadPosts();
	}
});
