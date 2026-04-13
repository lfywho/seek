document.addEventListener('DOMContentLoaded', function () {
	var feedContainer = document.getElementById('feedContainer');
	var modal = document.getElementById('postModal');
	var modalImage = document.getElementById('modalPostImg');
	var modalTitle = document.getElementById('modalPostTitulo');
	var modalAuthorName = document.getElementById('modalAuthorName');
	var modalDescription = document.getElementById('modalDescription');
	var modalFollowers = document.getElementById('modalAprovacao');
	var modalLikes = document.getElementById('modalLikes');
	var modalLikeButton = document.getElementById('modalLike');
	var modalFavoriteButton = document.getElementById('modalFavorite');
	var modalShareButton = document.getElementById('modalShare');
	var modalCloseButton = document.querySelector('.post-modal__close');
	var modalOverlay = document.querySelector('.post-modal__overlay');
	var commentInput = document.getElementById('commentInput');
	var sendCommentButton = document.getElementById('sendComment');
	var replyTarget = document.getElementById('replyTarget');
	var replyTargetText = document.getElementById('replyTargetText');
	var cancelReplyButton = document.getElementById('cancelReply');
	var commentsList = document.getElementById('commentsList');
	var loggedUser = getUsuarioLogado();
	var postsCache = [];
	var postState = {};
	var POST_ID_QUERY_KEY = 'postId';

	if (!feedContainer || !modal || !modalImage || !modalTitle || !modalAuthorName || !modalDescription || !modalFollowers || !modalLikes || !modalLikeButton || !modalFavoriteButton || !modalShareButton || !modalCloseButton || !modalOverlay || !commentInput || !sendCommentButton || !replyTarget || !replyTargetText || !cancelReplyButton || !commentsList) {
		return;
	}

	function escapeHtml(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
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

	function getPostImage(post) {
		if (Array.isArray(post.imagens) && post.imagens.length > 0) {
			return post.imagens[0];
		}

		return 'img/logo.png';
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

	function updateLikeButton(postId) {
		var state = postState[postId];
		if (!state) {
			return;
		}

		modalLikeButton.classList.toggle('active', !!state.liked);
		modalLikeButton.textContent = state.liked ? '❤️' : '👍';
		modalLikes.textContent = '❤️ ' + state.totalLikes + ' curtidas';
	}

	function updateFavoriteButton() {
		modalFavoriteButton.classList.toggle('active', !!modalFavoriteButton.dataset.active);
	}

	function setReplyTargetVisible(visible, commentId, userName) {
		replyTarget.hidden = !visible;
		replyTarget.dataset.commentId = commentId || '';
		replyTargetText.textContent = visible ? 'Respondendo a ' + userName : 'Respondendo comentário';
		if (!visible) {
			commentInput.placeholder = 'Adicione um comentário...';
			delete commentInput.dataset.replyTo;
			return;
		}

		commentInput.placeholder = 'Escreva sua resposta...';
		commentInput.dataset.replyTo = commentId;
		commentInput.focus();
	}

	function normalizeReplies(comment) {
		if (Array.isArray(comment.respostas)) {
			return comment.respostas;
		}

		if (Array.isArray(comment.replies)) {
			return comment.replies;
		}

		return [];
	}

	function createCommentElement(comment, level) {
		var article = document.createElement('article');
		article.className = 'post-modal__comment';
		if (level > 0) {
			article.style.marginLeft = '14px';
			article.style.borderLeft = '2px solid #e4e4e4';
		}

		var userName = comment.nome || comment.nome_de_usuario || comment.user || 'Usuário';
		var text = comment.comentario || comment.text || '';
		var commentId = comment.id || comment.comentario_id || null;

		var html = '';
		html += '<div class="post-modal__comment-user">' + escapeHtml(userName) + '</div>';
		html += '<div class="post-modal__comment-text">' + escapeHtml(text) + '</div>';

		if (commentId) {
			html += '<button type="button" class="post-modal__comment-reply" data-comment-id="' + escapeHtml(commentId) + '" data-comment-user="' + escapeHtml(userName) + '">Responder</button>';
		}

		article.innerHTML = html;

		normalizeReplies(comment).forEach(function (reply) {
			article.appendChild(createCommentElement(reply, level + 1));
		});

		return article;
	}

	function renderComments(postId, comments) {
		commentsList.innerHTML = '';

		if (!comments.length) {
			commentsList.innerHTML = '<p style="text-align:center;color:#8b8b8b;font-size:12px;">Nenhum comentário ainda.</p>';
			return;
		}

		comments.forEach(function (comment) {
			commentsList.appendChild(createCommentElement(comment, 0));
		});

		commentsList.querySelectorAll('.post-modal__comment-reply').forEach(function (button) {
			button.addEventListener('click', function () {
				var commentId = button.dataset.commentId;
				var commentUser = button.dataset.commentUser;
				setReplyTargetVisible(true, commentId, commentUser);
			});
		});
	}

	function setModalContent(post) {
		modal.dataset.currentPostId = String(post.id);
		modalImage.src = getPostImage(post);
		modalImage.alt = post.titulo || 'Post';
		modalTitle.textContent = post.titulo || 'Post';
		modalAuthorName.textContent = getPostAuthor(post);
		modalDescription.textContent = post.legenda || '';
		modalFollowers.textContent = (post.total_seguidores || 0) + ' seguidores';
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

		var followers = document.createElement('span');
		followers.className = 'likesPost';
		followers.textContent = (post.total_seguidores || 0) + ' seg.';

		var likes = document.createElement('span');
		likes.className = 'viewsPost';
		likes.innerHTML = '<img src="img/icons/like.svg" alt="">' + escapeHtml(post.total_likes || 0);

		likeView.appendChild(followers);
		likeView.appendChild(likes);

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
	}

	function closeModal() {
		modal.hidden = true;
		document.body.style.overflow = '';
		commentInput.value = '';
		setReplyTargetVisible(false);
		clearPostIdFromUrl();
	}

	async function loadComments(postId) {
		var response = await fetch(ip_api + '/comentarios/' + postId);
		if (!response.ok) {
			return [];
		}

		return response.json();
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
				comments: []
			};
		}

		openModal();
		modalLikeButton.disabled = !loggedUser;
		sendCommentButton.disabled = !loggedUser;

		try {
			var loadedComments = await loadComments(post.id);
			postState[post.id].comments = Array.isArray(loadedComments) ? loadedComments : [];

			var likeState = await loadLikeStatus(post.id);
			postState[post.id].liked = !!likeState;

			postState[post.id].totalLikes = await loadLikeCount(post.id) || postState[post.id].totalLikes;

			updateLikeButton(post.id);
			renderComments(post.id, postState[post.id].comments);
		} catch (error) {
			commentsList.innerHTML = '<p style="text-align:center;color:#b32929;font-size:12px;">Nao foi possivel carregar os comentarios.</p>';
		}
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

	async function submitComment() {
		var postId = Number(modal.dataset.currentPostId);
		var content = commentInput.value.trim();
		var state = postState[postId];

		if (!state || !loggedUser || !loggedUser.id || !content) {
			return;
		}

		var replyTo = commentInput.dataset.replyTo || '';
		var url = replyTo ? ip_api + '/comentarios/' + postId + '/responder/' + replyTo : ip_api + '/comentarios/' + postId;
		var body = replyTo
			? { idusuario: loggedUser.id, conteudo: content }
			: { idusuario: loggedUser.id, conteudo: content };

		var response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			return;
		}

		commentInput.value = '';
		setReplyTargetVisible(false);

		var comments = await loadComments(postId);
		state.comments = Array.isArray(comments) ? comments : [];
		renderComments(postId, state.comments);
	}

	async function shareCurrentPost() {
		var postId = Number(modal.dataset.currentPostId);
		if (!postId) {
			return;
		}

		var post = postsCache.find(function (item) {
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
		modalFavoriteButton.dataset.active = modalFavoriteButton.dataset.active === 'true' ? 'false' : 'true';
		updateFavoriteButton();
	});

	modalShareButton.addEventListener('click', function () {
		shareCurrentPost();
	});

	modalCloseButton.addEventListener('click', closeModal);
	modalOverlay.addEventListener('click', closeModal);

	sendCommentButton.addEventListener('click', function () {
		submitComment();
	});

	commentInput.addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			submitComment();
		}
	});

	cancelReplyButton.addEventListener('click', function () {
		setReplyTargetVisible(false);
	});

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && !modal.hidden) {
			closeModal();
		}
	});

	loadPosts();
});
