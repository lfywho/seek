<main class="inicio-login">
	<div class="inicio-login__overlay"></div>

	<section class="inicio-login__conteudo" aria-label="Tela inicial de login">
		<div class="inicio-login__splash" aria-hidden="true">
			<img
				class="inicio-login__logo"
				src="/assets/imgs/logo_login.png"
				alt="Seek"
			>
		</div>

		<article class="inicio-login__formulario" aria-label="Formulario de login">
			<img class="inicio-login__form-logo" src="/assets/imgs/logo_letraspretas_coluna.png" alt="Seek">

			<div class="inicio-login__painel inicio-login__painel--ativo" data-form-panel="login">
				<h2>Fazer Login</h2>
				<p>Ainda nao possui uma conta? <a href="#" data-toggle-form="cadastro" class="link_fake">cadastrar</a></p>

				<form class="inicio-login__form" action="/login" method="post">
					<label for="email">Email:</label>
					<input type="email" id="email" name="email" required>

					<label for="senha">Senha:</label>
					<div class="inicio-login__campo-senha">
						<input type="password" id="senha" name="senha" required>
						<button type="button" class="inicio-login__toggle-senha" aria-label="Mostrar senha" aria-pressed="false">
							<img src="/assets/imgs/icons/hide_circle.svg" alt="" aria-hidden="true">
						</button>
					</div>

					<a class="inicio-login__esqueci" href="#">Esqueci minha senha</a>

					<button type="submit" class="inicio-login__continuar">Continuar</button>

					<div class="inicio-login__divisor"><span>ou</span></div>

					<button type="button" class="inicio-login__social">
						<img src="/assets/imgs/logo_google.png" alt="Google">
						<span>Continuar com Google</span>
					</button>
					<button type="button" class="inicio-login__social">
						<img src="/assets/imgs/logo_apple.png" alt="Apple">
						<span>Continuar com Apple</span>
					</button>
				</form>
			</div>

			<div class="inicio-login__painel" data-form-panel="cadastro" hidden>
				<h2>Cadastro</h2>
				<p>Ja possui uma conta? <a href="#" data-toggle-form="login" class="link_fake">Entrar</a></p>

				<form class="inicio-login__form" action="/cadastrar" method="post" id="cadastro-form">
					<label for="cadastro-email">Email:</label>
					<input type="email" id="cadastro-email" name="email" required>

					<label for="cadastro-senha">Senha:</label>
					<div class="inicio-login__campo-senha">
						<input type="password" id="cadastro-senha" name="senha" required>
						<button type="button" class="inicio-login__toggle-senha" aria-label="Mostrar senha" aria-pressed="false">
							<img src="/assets/imgs/icons/hide_circle.svg" alt="" aria-hidden="true">
						</button>
					</div>

					<div class="inicio-login__dicas-senha" id="cadastro-dicas-senha" hidden>
						<p>Crie uma senha:</p>
						<ul>
							<li data-regra="tamanho">com pelo menos 8 caracteres</li>
							<li data-regra="maiuscula-minuscula">com letras minusculas (a-z) e maiusculas (A-Z)</li>
							<li data-regra="numero-simbolo">com pelo menos um numero (0-9) ou um simbolo</li>
							<li data-regra="sem-email">que nao inclua seu endereco de email</li>
						</ul>
					</div>

					<label for="cadastro-confirmar-senha">Confirmar senha:</label>
					<div class="inicio-login__campo-senha">
						<input type="password" id="cadastro-confirmar-senha" name="confirmar_senha" required>
						<button type="button" class="inicio-login__toggle-senha" aria-label="Mostrar senha" aria-pressed="false">
							<img src="/assets/imgs/icons/hide_circle.svg" alt="" aria-hidden="true">
						</button>
					</div>

					<button type="submit" class="inicio-login__continuar" id="cadastro-continuar" disabled>Continuar</button>

					<div class="inicio-login__divisor"><span>ou</span></div>

					<button type="button" class="inicio-login__social">
						<img src="/assets/imgs/logo_google.png" alt="Google">
						<span>Entrar com Google</span>
					</button>
					<button type="button" class="inicio-login__social">
						<img src="/assets/imgs/logo_apple.png" alt="Apple">
						<span>Entrar com Apple</span>
					</button>
				</form>
			</div>
		</article>
	</section>
</main>
