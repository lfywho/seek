<main class="conteudo">
    <?php
        $posts = [
            ['id' => 1, 'thumb' => '/assets/imgs/logo.png', 'titulo' => 'Projeto de interface', 'autor' => 'Nome do autor', 'aprovacao' => '80%', 'likes' => '3,5mil', 'descricao' => 'Este é um projeto de interface moderna e responsiva. Desenvolvido com foco em usabilidade e design contemporâneo.'],
            ['id' => 2, 'thumb' => '/assets/imgs/logo_login.png', 'titulo' => 'Manual visual', 'autor' => 'Nome do autor', 'aprovacao' => '80%', 'likes' => '3,5mil', 'descricao' => 'Guia completo de design visual com paletas de cores e tipografia detalhada.'],
            ['id' => 3, 'thumb' => '/assets/imgs/logo_letraspretas_coluna.png', 'titulo' => 'Concept art urbano', 'autor' => 'Nome do autor', 'aprovacao' => '80%', 'likes' => '3,5mil', 'descricao' => 'Concept art explorando ambientes urbanos futuristas com ilustrações digitais.'],
        ];
    ?>

    <section class="feedImgs" aria-label="Feed de projetos">
        <?php foreach ($posts as $post): ?>
            <article class="feedCard" data-post-id="<?= $post['id'] ?>" role="button" tabindex="0" aria-label="Abrir post <?= $post['titulo'] ?>">
                <div class="feedImg">
                    <img src="<?= $post['thumb'] ?>" alt="<?= $post['titulo'] ?>">
                </div>

                <div class="infoPost">
                    <div class="logoName">
                        <img class="logoUser" src="/assets/imgs/userProfile.png" alt="Foto do autor">
                        <span class="userName"><?= $post['autor'] ?></span>
                    </div>

                    <div class="likeView">
                        <span class="likesPost"><?= $post['aprovacao'] ?></span>
                        <span class="viewsPost">
                            <img src="/assets/imgs/icons/like.svg" alt="Curtidas">
                            <?= $post['likes'] ?>
                        </span>
                    </div>
                </div>
            </article>
        <?php endforeach; ?>
    </section>

    <!-- Modal de post -->
    <div class="post-modal" id="postModal" hidden>
        <div class="post-modal__overlay"></div>
        <div class="post-modal__content">
            <button class="post-modal__close" aria-label="Fechar modal">×</button>
            
            <div class="post-modal__image">
                <img id="modalPostImg" src="" alt="">
            </div>
            
            <div class="post-modal__info">
                <div class="post-modal__header">
                    <h2 id="modalPostTitulo"></h2>
                    <div class="post-modal__actions">
                        <button class="post-modal__like" id="modalLike" aria-label="Curtir post">
                            <img src="/assets/imgs/icons/like.svg" alt="">
                        </button>
                        <button class="post-modal__favorite" id="modalFavorite" aria-label="Adicionar aos favoritos">
                            <span>☆</span>
                        </button>
                    </div>
                </div>
                
                <div class="post-modal__author">
                    <img class="post-modal__author-avatar" id="modalAuthorAvatar" src="" alt="">
                    <span id="modalAuthorName"></span>
                </div>
                
                <p class="post-modal__description" id="modalDescription"></p>
                
                <div class="post-modal__stats">
                    <span id="modalAprovacao"></span>
                    <span id="modalLikes"></span>
                </div>
                
                <div class="post-modal__comments">
                    <h3>Comentários</h3>
                    <div class="post-modal__comment-input">
                        <img src="/assets/imgs/userProfile.png" alt="">
                        <input type="text" placeholder="Adicione um comentário..." id="commentInput">
                        <button id="sendComment">Enviar</button>
                    </div>
                    <div class="post-modal__reply-target" id="replyTarget" hidden>
                        <span id="replyTargetText"></span>
                        <button type="button" id="cancelReply">Cancelar</button>
                    </div>
                    <div class="post-modal__comments-list" id="commentsList"></div>
                </div>
            </div>
        </div>
    </div>

</main>