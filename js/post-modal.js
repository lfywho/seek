document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('postModal');
    const closeBtn = document.querySelector('.post-modal__close');
    const feedCards = document.querySelectorAll('.feedCard');
    const overlay = document.querySelector('.post-modal__overlay');
    const commentInput = document.getElementById('commentInput');
    const sendCommentBtn = document.getElementById('sendComment');
    const replyTarget = document.getElementById('replyTarget');
    const replyTargetText = document.getElementById('replyTargetText');
    const cancelReplyBtn = document.getElementById('cancelReply');
    let replyState = null;
    
    // Posts data - deve vir do servidor, mas por enquanto fixo aqui
    const postsData = {
        1: { thumb: '/assets/imgs/logo.png', titulo: 'Projeto de interface', autor: 'Nome do autor', aprovacao: '80%', likes: '3,5mil', descricao: 'Este é um projeto de interface moderna e responsiva. Desenvolvido com foco em usabilidade e design contemporâneo.' },
        2: { thumb: '/assets/imgs/logo_login.png', titulo: 'Manual visual', autor: 'Nome do autor', aprovacao: '80%', likes: '3,5mil', descricao: 'Guia completo de design visual com paletas de cores e tipografia detalhada.' },
        3: { thumb: '/assets/imgs/logo_letraspretas_coluna.png', titulo: 'Concept art urbano', autor: 'Nome do autor', aprovacao: '80%', likes: '3,5mil', descricao: 'Concept art explorando ambientes urbanos futuristas com ilustrações digitais.' },
    };

    // Estado de posts (likes, favoritos e comentarios)
    const postState = {};

    function getInitialCommentsByPost(postId) {
        const baseComment = {
            id: 'c1',
            user: 'Ana Silva',
            text: 'Projeto muito bom! Curti bastante a composicao visual.',
            replies: []
        };

        return [
            {
                ...baseComment,
                id: 'c1-' + postId
            }
        ];
    }
    
    function openModal(postId) {
        const post = postsData[postId];
        if (!post) return;

        // Preencher dados do modal
        document.getElementById('modalPostImg').src = post.thumb;
        document.getElementById('modalPostTitulo').textContent = post.titulo;
        document.getElementById('modalAuthorAvatar').src = '/assets/imgs/userProfile.png';
        document.getElementById('modalAuthorName').textContent = post.autor;
        document.getElementById('modalDescription').textContent = post.descricao;
        document.getElementById('modalAprovacao').textContent = post.aprovacao;
        document.getElementById('modalLikes').textContent = '👍 ' + post.likes;

        // Inicializar estado do post
        if (!postState[postId]) {
            postState[postId] = {
                liked: false,
                favorited: false,
                comments: getInitialCommentsByPost(postId)
            };
        }

        replyState = null;
        hideReplyTarget();

        // Atualizar botões
        updatePostButtons(postId);
        loadComments(postId);

        // Mostrar modal
        modal.hidden = false;
        modal.dataset.currentPostId = postId;
    }

    function closeModal() {
        modal.hidden = true;
        modal.dataset.currentPostId = null;
        replyState = null;
        hideReplyTarget();
    }

    function showReplyTarget(commentId, userName) {
        replyState = commentId;
        replyTargetText.textContent = 'Respondendo ' + userName;
        replyTarget.hidden = false;
        commentInput.placeholder = 'Escreva sua resposta...';
        commentInput.focus();
    }

    function hideReplyTarget() {
        replyState = null;
        replyTarget.hidden = true;
        commentInput.placeholder = 'Adicione um comentário...';
    }

    function updatePostButtons(postId) {
        const state = postState[postId];
        const likeBtn = document.getElementById('modalLike');
        const favoriteBtn = document.getElementById('modalFavorite');

        if (state.liked) {
            likeBtn.classList.add('active');
        } else {
            likeBtn.classList.remove('active');
        }

        if (state.favorited) {
            favoriteBtn.classList.add('active');
        } else {
            favoriteBtn.classList.remove('active');
        }
    }

    function loadComments(postId) {
        const commentsList = document.getElementById('commentsList');
        const state = postState[postId];
        
        commentsList.innerHTML = '';
        
        if (state.comments.length === 0) {
            commentsList.innerHTML = '<p style="text-align: center; color: #999; font-size: 12px;">Nenhum comentário ainda</p>';
            return;
        }

        state.comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = 'post-modal__comment';
            div.innerHTML = `
                <div class="post-modal__comment-user">${comment.user}</div>
                <div class="post-modal__comment-text">${comment.text}</div>
                <button type="button" class="post-modal__comment-reply" data-reply-id="${comment.id}" data-reply-user="${comment.user}">Responder</button>
            `;

            if (comment.replies && comment.replies.length) {
                const repliesWrapper = document.createElement('div');
                repliesWrapper.className = 'post-modal__replies';

                comment.replies.forEach(function (reply) {
                    const replyDiv = document.createElement('div');
                    replyDiv.className = 'post-modal__reply';
                    replyDiv.innerHTML = `
                        <div class="post-modal__comment-user">${reply.user}</div>
                        <div class="post-modal__comment-text">${reply.text}</div>
                    `;
                    repliesWrapper.appendChild(replyDiv);
                });

                div.appendChild(repliesWrapper);
            }

            commentsList.appendChild(div);
        });

        commentsList.querySelectorAll('.post-modal__comment-reply').forEach(function (btn) {
            btn.addEventListener('click', function () {
                showReplyTarget(btn.dataset.replyId, btn.dataset.replyUser);
            });
        });
    }

    function addComment(postId, commentText) {
        if (!commentText.trim()) return;
        
        const state = postState[postId];

        if (replyState) {
            const comment = state.comments.find(function (item) {
                return item.id === replyState;
            });

            if (comment) {
                comment.replies = comment.replies || [];
                comment.replies.push({ user: 'Você', text: commentText });
            }
            hideReplyTarget();
        } else {
            state.comments.push({
                id: 'c-' + Date.now(),
                user: 'Você',
                text: commentText,
                replies: []
            });
        }

        loadComments(postId);
    }

    // Event listeners
    feedCards.forEach(card => {
        card.addEventListener('click', function (e) {
            e.stopPropagation();
            const postId = this.dataset.postId;
            openModal(postId);
        });

        card.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const postId = this.dataset.postId;
                openModal(postId);
            }
        });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Like button
    document.getElementById('modalLike').addEventListener('click', function () {
        const postId = modal.dataset.currentPostId;
        const state = postState[postId];
        state.liked = !state.liked;
        updatePostButtons(postId);
    });

    // Favorite button
    document.getElementById('modalFavorite').addEventListener('click', function () {
        const postId = modal.dataset.currentPostId;
        const state = postState[postId];
        state.favorited = !state.favorited;
        updatePostButtons(postId);
    });

    // Comment input
    sendCommentBtn.addEventListener('click', function () {
        const postId = modal.dataset.currentPostId;
        const text = commentInput.value;
        
        if (text.trim()) {
            addComment(postId, text);
            commentInput.value = '';
        }
    });

    commentInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const postId = modal.dataset.currentPostId;
            const text = this.value;
            
            if (text.trim()) {
                addComment(postId, text);
                this.value = '';
            }
        }
    });

    cancelReplyBtn.addEventListener('click', hideReplyTarget);

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });
});
