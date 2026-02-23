document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.hero')?.classList.add('hero-loaded');
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-visible'));
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0 }
    );
  
    document.querySelectorAll('.works h2, .projects .card').forEach((el) => observer.observe(el));
  });