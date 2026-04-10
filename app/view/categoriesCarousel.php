<?php
	$categorias = [
		['nome' => 'Fotografia', 'cor' => ['#1b1b1b', '#2f2f2f']],
		['nome' => 'Arte 3D', 'cor' => ['#2d2a4a', '#5c4d7d']],
		['nome' => 'Design gráfico', 'cor' => ['#444', '#6a6a6a']],
		['nome' => 'UI/UX', 'cor' => ['#3a3f47', '#6d727c']],
		['nome' => 'Design de produtos', 'cor' => ['#5b3300', '#9a5c0b']],
		['nome' => 'Moda', 'cor' => ['#2c2c2c', '#555']],
		['nome' => 'Concept art', 'cor' => ['#303030', '#4d4d4d']],
		['nome' => 'Urbano', 'cor' => ['#262626', '#404040']],
		['nome' => 'Arquitetura', 'cor' => ['#3b3b3b', '#5f5f5f']],
		['nome' => 'Branding', 'cor' => ['#2f2f2f', '#5a5a5a']],
		['nome' => 'Marca', 'cor' => ['#2b2f45', '#4f5670']],
		['nome' => 'Ilustração', 'cor' => ['#2c2c3a', '#4c4c69']],
		['nome' => 'Tipografia', 'cor' => ['#1f1f1f', '#3b3b3b']],
		['nome' => 'Motion', 'cor' => ['#2a2a2a', '#4f4f4f']],
	];
?>

<section class="categories-carousel">

	<div class="carousel-wrapper">
		<button class="carousel-btn prev" aria-label="Categorias anteriores">&#10094;</button>

		<div class="carousel-viewport">
			<div class="carousel-track">
				<?php foreach ($categorias as $categoria): ?>
					<button
						class="category-card"
						style="background: linear-gradient(135deg, <?= $categoria['cor'][0] ?>, <?= $categoria['cor'][1] ?>);"
						aria-label="Ver categoria <?= $categoria['nome'] ?>"
					>
						<span><?= $categoria['nome'] ?></span>
					</button>
				<?php endforeach; ?>
			</div>
		</div>

		<button class="carousel-btn next" aria-label="Próximas categorias">&#10095;</button>
	</div>
</section>

<script>
	document.addEventListener('DOMContentLoaded', () => {
		const track = document.querySelector('.categories-carousel .carousel-track');
		if (!track) return;

		const prev = document.querySelector('.categories-carousel .carousel-btn.prev');
		const next = document.querySelector('.categories-carousel .carousel-btn.next');
		const cards = Array.from(track.querySelectorAll('.category-card'));

		if (!cards.length) return;

		const getScrollStep = () => {
			const styles = window.getComputedStyle(track);
			const gap = parseFloat(styles.columnGap || styles.gap || '0');
			const cardWidth = cards[0].offsetWidth + gap;
			const visibleCards = window.innerWidth < 768 ? 2 : 4;
			return cardWidth * visibleCards;
		};

		const updateButtons = () => {
			const maxScroll = track.scrollWidth - track.clientWidth - 1;
			prev.classList.toggle('disabled', track.scrollLeft <= 0);
			next.classList.toggle('disabled', track.scrollLeft >= maxScroll);
		};

		prev.addEventListener('click', () => {
			track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
		});

		next.addEventListener('click', () => {
			track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
		});

		track.addEventListener('scroll', updateButtons);
		window.addEventListener('resize', updateButtons);
		updateButtons();
	});
</script>