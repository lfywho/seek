document.addEventListener('DOMContentLoaded', function () {
	var feedContainer = document.getElementById('feedContainer');
	var modal = document.getElementById('postModal');
	var modalTitle = document.getElementById('modalPostTitulo');
	var modalAuthorName = document.getElementById('modalAuthorName');
	var modalAuthorAvatar = document.getElementById('modalAuthorAvatar');
	var modalGallery = document.getElementById('modalGallery');
	var modalSidebarAuthorName = document.getElementById('modalSidebarAuthorName');
	var modalSidebarAuthorAvatar = document.getElementById('modalSidebarAuthorAvatar');
	var modalSidebarFollowButton = document.getElementById('modalSidebarFollowButton');
	var modalSidebarGallery = document.getElementById('modalSidebarGallery');
	var modalSidebarProjects = document.getElementById('modalSidebarProjects');
	var modalLikeButton = document.getElementById('modalLike');
	var modalFavoriteButton = document.getElementById('modalFavorite');
	var modalShareButton = document.getElementById('modalShare');
	var modalInfoButton = document.getElementById('modalInfo');
	var modalCommentsButton = document.getElementById('modalComments');
	var modalLikeCount = document.getElementById('modalLikeCount');
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
	
	// Utilizado apenas para saber se é o próprio usuário (para ocultar o botão de seguir)
	var loggedUser = typeof getUsuarioLogado === 'function' ? getUsuarioLogado() : null;
	
	var postsCache = [];
	var postsById = {};
	var postState = {};
	var POST_ID_QUERY_KEY = 'postId';
	var replyState = null;
	var feedRequestId = 0;

	if (!modal || !modalTitle || !modalAuthorName || !modalAuthorAvatar || !modalGallery || !modalLikeButton || !modalShareButton || !modalCloseButton || !modalOverlay) {
		return;
	}

	function ensureLikeCountElement() {
		if (modalLikeCount) {
			return modalLikeCount;
		}

		modalLikeCount = document.createElement('span');
		modalLikeCount.id = 'modalLikeCount';
		modalLikeCount.className = 'post-modal__like-count';
		modalLikeCount.textContent = '0';

		var wrapper = document.createElement('div');
		wrapper.className = 'post-modal__like-action';
		modalLikeButton.parentNode.insertBefore(wrapper, modalLikeButton);
		wrapper.appendChild(modalLikeButton);
		wrapper.appendChild(modalLikeCount);

		return modalLikeCount;
	}

	function rememberPost(post) {
		if (!post || post.id == null) return;
		var numericId = Number(post.id);
		if (!numericId) return;

		postsById[numericId] = post;
		for (var index = 0; index < postsCache.length; index += 1) {
			if (Number(postsCache[index].id) === numericId) return;
		}
		postsCache.push(post);
	}

	function hideReplyTarget() {
		replyState = null;
		if (!replyTarget) return;
		replyTarget.hidden = true;
		if (replyTargetText) replyTargetText.textContent = '';
		if (commentInput) commentInput.placeholder = 'Adicione um comentário...';
	}

	function showReplyTarget(commentId, userName) {
		replyState = commentId;
		if (!replyTarget) return;
		if (replyTargetText) replyTargetText.textContent = 'Respondendo ' + userName;
		replyTarget.hidden = false;
		if (commentInput) {
			commentInput.placeholder = 'Escreva sua resposta...';
			commentInput.focus();
		}
	}

	function openUserProfile(userId) {
		if (!userId) return;
		window.location.href = 'usuario.html?id=' + encodeURIComponent(userId);
	}

	function normalizeComment(comment) {
		return {
			id: comment.id,
			userId: comment.usuario?.id || '',
			user: comment.usuario?.nome || 'Usuário',
			photo: comment.usuario?.foto_perfil || 'img/userProfile.png',
			text: comment.comentario,
			date: comment.data_comentario,
			repliesCount: comment.quantidade_respostas || 0
		};
	}

	function normalizeReply(reply) {
		return {
			id: reply.id,
			userId: reply.usuario?.id || '',
			user: reply.usuario?.nome || 'Usuário',
			photo: reply.usuario?.foto_perfil || 'img/userProfile.png',
			text: reply.resposta,
			date: reply.data_resposta
		};
	}

	function makeProfileTrigger(element, userId, userName) {
		if (!element || !userId) return;
		element.style.cursor = 'pointer';
		element.setAttribute('role', 'link');
		element.setAttribute('tabindex', '0');
		element.setAttribute('aria-label', 'Abrir perfil de ' + (userName || 'usuário'));
		element.addEventListener('click', function () { openUserProfile(userId); });
		element.addEventListener('keydown', function (event) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				openUserProfile(userId);
			}
		});
	}

	// Busca as respostas de um comentário na API
	async function loadRepliesForComment(commentId, repliesContainer, loadButton) {
		loadButton.textContent = 'Carregando...';
		loadButton.disabled = true;

		try {
			var response = await fetch(ip_api + '/posts/comentarios/' + commentId + '/respostas', {
				method: 'GET',
				credentials: 'include'
			});
			var data = await response.json();

			if (response.ok && data.success && data.data) {
				var replies = data.data.map(normalizeReply);
				repliesContainer.innerHTML = ''; // Limpa o botão
				replies.forEach(function (reply) {
					repliesContainer.appendChild(createCommentNode(reply, true));
				});
			} else {
				loadButton.textContent = 'Erro ao carregar';
			}
		} catch (error) {
			console.error(error);
			loadButton.textContent = 'Erro ao carregar';
			loadButton.disabled = false;
		}
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
			// Se for uma resposta, respondemos ao comentário principal (não aninhamos infinitamente)
			var targetId = isReply ? wrapper.parentElement.dataset.commentId : comment.id;
			showReplyTarget(targetId || comment.id, comment.user || 'Usuário');
		});

		body.appendChild(user);
		body.appendChild(text);
		body.appendChild(replyBtn);

		row.appendChild(avatar);
		row.appendChild(body);
		wrapper.appendChild(row);

		// Se o comentário principal possuir respostas, cria um botão para carregá-las
		if (!isReply && comment.repliesCount > 0) {
			var repliesWrapper = document.createElement('div');
			repliesWrapper.className = 'post-modal__replies';
			repliesWrapper.dataset.commentId = comment.id;

			var loadRepliesBtn = document.createElement('button');
			loadRepliesBtn.className = 'post-modal__load-replies';
			loadRepliesBtn.textContent = 'Ver ' + comment.repliesCount + ' resposta(s)';
			loadRepliesBtn.addEventListener('click', function() {
				loadRepliesForComment(comment.id, repliesWrapper, loadRepliesBtn);
			});

			repliesWrapper.appendChild(loadRepliesBtn);
			wrapper.appendChild(repliesWrapper);
		}

		return wrapper;
	}

	function renderComments(postId) {
		if (!commentsList) return;

		var state = postState[postId];
		if (!state) {
			commentsList.innerHTML = '';
			return;
		}

		if (state.commentsLoading) {
			commentsList.innerHTML = '<p class="post-modal__comments-empty">Carregando detalhes do post...</p>';
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

	// Unificamos o carregamento de Comentários, Likes e Favoritos através da rota de detalhes do post
	async function loadPostDetails(postId) {
		var state = postState[postId];
		if (!state) return;

		state.commentsLoading = true;
		renderComments(postId);

		try {
			var response = await fetch(ip_api + '/posts/' + encodeURIComponent(postId), {
				method: 'GET',
				credentials: 'include'
			});
			
			var data = await response.json();
			
			if (response.ok && data.success && data.data) {
				var detailData = data.data;
				
				state.liked = !!detailData.usuario_curtiu;
				state.favorite = !!detailData.usuario_salvou;
				state.totalLikes = Number(detailData.likes) || 0;
				state.comments = Array.isArray(detailData.comentarios) ? detailData.comentarios.map(normalizeComment) : [];
				
				updateLikeButton(postId);
				updateFavoriteButton(postId);
			} else {
				throw new Error(data.message || 'Falha ao carregar detalhes');
			}
		} catch (error) {
			console.error(error);
			commentsList.innerHTML = '<p class="post-modal__comments-empty">Não foi possível carregar as informações do post.</p>';
		} finally {
			state.commentsLoading = false;
			renderComments(postId);
		}
	}

	async function submitComment(postId, rawText) {
		var text = (rawText || '').trim();
		if (!text) return;

		sendCommentButton.disabled = true;

		// Se tem replyState, a rota é de resposta. Se não, é comentário comum.
		var endpoint = replyState
			? '/posts/' + encodeURIComponent(replyState) + '/comentarios'
			: '/posts/' + encodeURIComponent(postId) + '/comentarios';

		var bodyPayload = replyState 
			? { resposta: text } 
			: { comentario: text };

		try {
			var response = await fetch(ip_api + endpoint, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bodyPayload)
			});
			
			var data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.message || 'Falha ao enviar comentário');
			}

			hideReplyTarget();
			if (commentInput) commentInput.value = '';
			
			// Recarrega os detalhes do post para trazer o comentário atualizado
			await loadPostDetails(postId);
			
		} catch (error) {
			console.error(error);
			alert('Não foi possível enviar o comentário.');
		} finally {
			sendCommentButton.disabled = false;
		}
	}

	function formatDate(value) {
		if (!value) return '';
		var date = new Date(value);
		if (Number.isNaN(date.getTime())) return '';
		return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	// Funções auxiliares para lidar com as diferenças do JSON retornado pela Feed
	function getPostImage(post) {
		if (post.capa) return post.capa;
		if (Array.isArray(post.imagens) && post.imagens.length > 0) return post.imagens[0];
		return 'img/logo.png';
	}

	function getPostImages(post) {
		if (Array.isArray(post.imagens) && post.imagens.length > 0) return post.imagens.filter(Boolean);
		if (post.capa) return [post.capa];
		return ['img/logo.png'];
	}

	function getPostAuthor(post) {
		return post.criador?.nome || post.nome || 'Usuário';
	}

	function getPostAuthorPhoto(post) {
		return post.criador?.foto_perfil || post.foto_perfil || 'img/userProfile.png';
	}

	function getPostAuthorId(post) {
		return post.criador?.id || post.usuario_id || null;
	}

	function esconderBotaoSeguirModal(esconder) {
		if (!modalSidebarFollowButton) return;
		modalSidebarFollowButton.style.display = esconder ? 'none' : '';
	}

	function atualizarBotaoSeguirModal(estaSeguindo) {
		if (!modalSidebarFollowButton) return;
		modalSidebarFollowButton.textContent = estaSeguindo ? 'Deixar de seguir' : 'Seguir';
		modalSidebarFollowButton.classList.toggle('is-following', !!estaSeguindo);
		modalSidebarFollowButton.setAttribute('aria-pressed', estaSeguindo ? 'true' : 'false');
		// Salva o estado atual no botão para ser lido no toggle
		modalSidebarFollowButton.dataset.seguindo = estaSeguindo ? '1' : '0';
	}

	async function inicializarBotaoSeguirModal(post) {
		if (!modalSidebarFollowButton) return;

		var idAutor = getPostAuthorId(post);
		if (!idAutor || (loggedUser && String(loggedUser.id) === String(idAutor))) {
			esconderBotaoSeguirModal(true);
			return;
		}

		esconderBotaoSeguirModal(false);
		modalSidebarFollowButton.disabled = true;

		try {
			var response = await fetch(ip_api + '/seguidores/status/' + encodeURIComponent(idAutor), {
				method: 'GET',
				credentials: 'include'
			});
			var data = await response.json();
			
			if (response.ok && data.success && data.data) {
				atualizarBotaoSeguirModal(data.data.seguindo);
			} else {
				atualizarBotaoSeguirModal(false);
			}
		} catch (error) {
			console.error(error);
			atualizarBotaoSeguirModal(false);
		} finally {
			modalSidebarFollowButton.disabled = false;
		}
	}

	async function alternarSeguimentoAutor(idAutor) {
		var estaSeguindo = modalSidebarFollowButton.dataset.seguindo === '1';
		var method = estaSeguindo ? 'DELETE' : 'POST';

		var response = await fetch(ip_api + '/seguidores/' + encodeURIComponent(idAutor), {
			method: method,
			credentials: 'include'
		});
		
		var data = await response.json();

		if (!response.ok || !data.success) {
			throw new Error(data.message || 'Falha ao alternar seguimento');
		}

		// Se tudo deu certo, inverte o status local
		atualizarBotaoSeguirModal(!estaSeguindo);
	}

	function getPostIdFromUrl() {
		var params = new URLSearchParams(window.location.search);
		var rawValue = params.get(POST_ID_QUERY_KEY);
		if (!rawValue) return null;
		var parsed = Number(rawValue);
		return (!Number.isInteger(parsed) || parsed <= 0) ? null : parsed;
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
		if (!container) return;
		var list = Array.isArray(images) ? images.filter(Boolean) : [];
		container.innerHTML = '';
		for (var index = 0; index < 3; index += 1) {
			var src = list[index] || '';
			container.appendChild(createSidebarThumb(src, (titlePrefix || 'Imagem') + ' ' + (index + 1)));
		}
	}

	function renderGallery(post) {
		var images = getPostImages(post);
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
		if (modalSidebarAuthorName) modalSidebarAuthorName.textContent = getPostAuthor(post);
		if (modalSidebarAuthorAvatar) {
			modalSidebarAuthorAvatar.src = getPostAuthorPhoto(post);
			modalSidebarAuthorAvatar.alt = getPostAuthor(post);
		}
		renderGallery(post);
	}

	function updateLikeButton(postId) {
		var state = postState[postId];
		if (!state) return;

		modalLikeButton.classList.toggle('active', !!state.liked);
		modalLikeButton.setAttribute('aria-pressed', state.liked ? 'true' : 'false');
		modalLikeButton.title = state.totalLikes + ' curtidas';
		ensureLikeCountElement().textContent = String(state.totalLikes);
	}

	function updateFavoriteButton(postId) {
		var state = postState[postId];
		if (!state || !modalFavoriteButton) return;

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
		postTime.textContent = post.tempo_atras || formatDate(post.data_postagem);

		likeView.appendChild(postTime);
		info.appendChild(left);
		info.appendChild(likeView);

		article.appendChild(body);
		article.appendChild(info);

		article.addEventListener('click', function () { openPost(post); });
		article.addEventListener('keydown', function (event) {
			if (event.key === 'Enter') openPost(post);
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
		if (commentInput) commentInput.value = '';
		clearPostIdFromUrl();
	}

	async function openPost(post, options) {
		rememberPost(post);
		var config = options || {};
		if (config.syncUrl !== false) setPostIdInUrl(post.id);

		setModalContent(post);
		await inicializarBotaoSeguirModal(post);

		if (!postState[post.id]) {
			postState[post.id] = {
				liked: false,
				favorite: false,
				totalLikes: Number(post.likes) || 0,
				comments: [],
				commentsLoading: true
			};
		}

		hideReplyTarget();
		if (commentInput) commentInput.value = '';

		openModal();
		
		// Atualiza layout visual com dados parciais enquanto carrega o resto
		updateLikeButton(post.id); 
		
		// Carrega os dados ricos (comentários, estado se eu dei like, se eu salvei, etc)
		await loadPostDetails(post.id);
	}

	async function toggleLike() {
		var postId = Number(modal.dataset.currentPostId);
		var state = postState[postId];
		if (!state) return;

		modalLikeButton.disabled = true;
		var method = state.liked ? 'DELETE' : 'POST';

		try {
			var response = await fetch(ip_api + '/posts/' + encodeURIComponent(postId) + '/like', {
				method: method,
				credentials: 'include'
			});
			var data = await response.json();

			if (response.ok && data.success) {
				state.liked = !state.liked;
				state.totalLikes += state.liked ? 1 : -1;
				updateLikeButton(postId);
			} else {
				// Requer auth / status 401
				if(response.status === 401) alert("Faça login para curtir.");
			}
		} catch (error) {
			console.error(error);
		} finally {
			modalLikeButton.disabled = false;
		}
	}

	async function toggleFavorite() {
		var postId = Number(modal.dataset.currentPostId);
		var state = postState[postId];
		if (!state || !modalFavoriteButton) return;

		modalFavoriteButton.disabled = true;
		var method = state.favorite ? 'DELETE' : 'POST';

		try {
			var response = await fetch(ip_api + '/posts/' + encodeURIComponent(postId) + '/salvar', {
				method: method,
				credentials: 'include'
			});
			var data = await response.json();

			if (response.ok && data.success) {
				state.favorite = !state.favorite;
				updateFavoriteButton(postId);
			} else {
				if(response.status === 401) alert("Faça login para salvar o post.");
			}
		} catch (error) {
			console.error(error);
		} finally {
			modalFavoriteButton.disabled = false;
		}
	}

	if (modalSidebarFollowButton) {
		modalSidebarFollowButton.addEventListener('click', async function () {
			var postId = Number(modal.dataset.currentPostId);
			var post = postsById[postId];
			if (!post) return;

			var idAutor = getPostAuthorId(post);
			if (!idAutor) return;

			modalSidebarFollowButton.disabled = true;
			try {
				await alternarSeguimentoAutor(idAutor);
			} catch (error) {
				console.error(error);
				alert("Não foi possível realizar esta ação no momento.");
			} finally {
				modalSidebarFollowButton.disabled = false;
			}
		});
	}

	if (sendCommentButton && commentInput) {
		sendCommentButton.addEventListener('click', async function () {
			var postId = Number(modal.dataset.currentPostId);
			if (postId) await submitComment(postId, commentInput.value);
		});

		commentInput.addEventListener('keydown', function (event) {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				sendCommentButton.click();
			}
		});
	}

	if (cancelReplyButton) {
		cancelReplyButton.addEventListener('click', function () { hideReplyTarget(); });
	}

	async function openPostFromUrlIfPresent() {
		var postIdFromUrl = getPostIdFromUrl();
		if (!postIdFromUrl) return;

		var targetPost = postsCache.find(function (post) { return Number(post.id) === postIdFromUrl; });
		if (!targetPost) {
			clearPostIdFromUrl();
			return;
		}

		await openPost(targetPost, { syncUrl: false });
	}

	async function loadPosts(endpoint) {
		var requestId = ++feedRequestId;
		var feedEndpoint = endpoint || '/posts';

		feedContainer.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#777;padding:20px 0;">Carregando posts...</p>';

		try {
			var response = await fetch(ip_api + feedEndpoint, {
				method: 'GET',
				credentials: 'include' // Envia cookie para saber autenticação, caso exista
			});
			var resData = await response.json();

			if (!response.ok || !resData.success) {
				throw new Error('Falha ao carregar posts');
			}

			if (requestId !== feedRequestId) return;

			postsCache = Array.isArray(resData.data) ? resData.data : [];
			postsById = {};
			postsCache.forEach(function (post) { rememberPost(post); });
			
			renderFeed(postsCache);
			
			if (feedEndpoint === '/posts') {
				await openPostFromUrlIfPresent();
			}
		} catch (error) {
			if (requestId !== feedRequestId) return;
			feedContainer.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#b32929;padding:20px 0;">Não foi possível carregar os posts.</p>';
		}
	}

	modalLikeButton.addEventListener('click', function () { toggleLike(); });
	
	if (modalFavoriteButton) {
		modalFavoriteButton.addEventListener('click', function () { toggleFavorite(); });
	}

	modalShareButton.addEventListener('click', async function () {
		var postId = Number(modal.dataset.currentPostId);
		if (!postId) return;

		var url = new URL(window.location.href);
		url.searchParams.set(POST_ID_QUERY_KEY, String(postId));
		var shareUrl = url.toString();

		if (navigator.share) {
			try {
				await navigator.share({ title: 'Post no Seek', url: shareUrl });
				return;
			} catch (e) { if (e.name === 'AbortError') return; }
		}

		if (navigator.clipboard && navigator.clipboard.writeText) {
			await navigator.clipboard.writeText(shareUrl);
			alert('Link copiado para a área de transferência.');
		} else {
			alert('Copie este link: ' + shareUrl);
		}
	});

	modalCloseButton.addEventListener('click', closeModal);
	modalOverlay.addEventListener('click', closeModal);
	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && !modal.hidden) closeModal();
	});

	if (modalScrollUpButton) {
		modalScrollUpButton.addEventListener('click', function () {
			modal.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	if (modalScrollDownButton) {
		modalScrollDownButton.addEventListener('click', function () {
			if(commentsList) {
				var modalRect = modal.getBoundingClientRect();
				var targetRect = commentsList.getBoundingClientRect();
				modal.scrollTo({ top: Math.max(0, targetRect.top - modalRect.top + modal.scrollTop), behavior: 'smooth' });
			}
		});
	}

	window.seekOpenPostModal = function (post, options) { return openPost(post, options); };
	window.seekCarregarPosts = function (endpoint) { return loadPosts(endpoint || '/posts'); };

	if (feedContainer) {
		loadPosts();
	}
});