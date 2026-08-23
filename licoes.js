
    /* ===== ESTADO DA APLICAÇÃO ===== */
    const TOTAL = 9;
    let completedCount = 2;

    /* ===== REFERÊNCIAS DO DOM ===== */
    const progressFill = document.getElementById('progressFill');
    const progressCount = document.getElementById('progressCount');
    const toastContainer = document.getElementById('toastContainer');
    const grid = document.getElementById('activitiesGrid');
    const cards = Array.from(grid.querySelectorAll('.activity-card'));

    /* ===== ANIMAÇÃO DE ENTRADA ESCALONADA DOS CARDS ===== */
    function revealCards() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index, 10);
            const delay = 300 + index * 80;
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      cards.forEach((card) => observer.observe(card));
    }

    revealCards();

    /* ===== ATUALIZA BARRA DE PROGRESSO ===== */
    function updateProgress() {
      const pct = Math.round((completedCount / TOTAL) * 100);
      progressFill.style.width = pct + '%';
      progressCount.textContent = completedCount + ' de ' + TOTAL + ' concluídas';

      progressCount.classList.remove('bump');
      void progressCount.offsetWidth;
      progressCount.classList.add('bump');
    }

    /* ===== SISTEMA DE TOAST ===== */
    function showToast(message, icon) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = '<i class="fas fa-' + (icon || 'check-circle') + '"></i> ' + message;
      toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
      }, 3000);
    }

    /* ===== EFEITO DE CONFETE ===== */
    function launchConfetti(originX, originY) {
      const colors = ['#2E7D32', '#66BB6A', '#FFD54F', '#FF8A65', '#FFFFFF', '#A5D6A7', '#F5DEB3'];
      const count = 40;

      for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const size = 6 + Math.random() * 8;
        piece.style.width = size + 'px';
        piece.style.height = size * (0.5 + Math.random() * 0.8) + 'px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.left = originX + 'px';
        piece.style.top = originY + 'px';

        const xDrift = (Math.random() - 0.5) * 300;
        const yFall = 200 + Math.random() * 250;
        const rotation = (Math.random() - 0.5) * 1080;
        const duration = 0.8 + Math.random() * 0.8;

        piece.style.setProperty('--x-drift', xDrift + 'px');
        piece.style.setProperty('--y-fall', yFall + 'px');
        piece.style.setProperty('--rotation', rotation + 'deg');
        piece.style.setProperty('--duration', duration + 's');

        document.body.appendChild(piece);

        setTimeout(() => piece.remove(), duration * 1000 + 100);
      }
    }

    /* ===== TRANSFORMA CARD EM CONCLUÍDO ===== */
    function completeCard(card) {
      const circle = card.querySelector('.icon-circle');
      const badge = card.querySelector('.status-badge');
      const btn = card.querySelector('.card-btn');
      const title = card.querySelector('h3').textContent;

      card.classList.add('completing');
      setTimeout(() => card.classList.remove('completing'), 600);

      const checkBadge = document.createElement('div');
      checkBadge.className = 'check-badge';
      checkBadge.innerHTML = '<i class="fas fa-check"></i>';
      circle.appendChild(checkBadge);

      badge.className = 'status-badge badge-concluida';
      badge.innerHTML = '<i class="fas fa-check-circle"></i> Concluída';

      btn.className = 'card-btn btn-rever';
      btn.dataset.action = 'review';
      btn.textContent = 'Rever Lição';

      card.dataset.completed = 'true';

      completedCount++;
      updateProgress();

      const rect = card.getBoundingClientRect();
      launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

      showToast('"' + title + '" concluída!', 'check-circle');

      if (completedCount === TOTAL) {
        setTimeout(() => {
          showToast('Parabéns! Todas as atividades foram concluídas!', 'trophy');
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              launchConfetti(
                window.innerWidth * (0.2 + Math.random() * 0.6),
                window.innerHeight * 0.3
              );
            }, i * 300);
          }
        }, 800);
      }
    }

    /* ===== EFEITO DE RIPPLE NO BOTÃO ===== */
    function setRipplePosition(btn, e) {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--ripple-x', x + '%');
      btn.style.setProperty('--ripple-y', y + '%');
    }

    /* ===== DELEGAÇÃO DE EVENTOS NOS CARDS ===== */
    grid.addEventListener('click', function(e) {
      const btn = e.target.closest('.card-btn');
      if (!btn) return;

      e.stopPropagation();

      const card = btn.closest('.activity-card');
      const action = btn.dataset.action;

      setRipplePosition(btn, e);

      if (action === 'start') {
        completeCard(card);
      } else if (action === 'review') {
        const title = card.querySelector('h3').textContent;
        showToast('Revisando "' + title + '"...', 'redo');
      }
    });

    /* ===== BOTÃO VOLTAR ===== */
    document.querySelector('.btn-voltar').addEventListener('click', function() {
      showToast('Voltando para a tela anterior...', 'arrow-left');
    });

    /* ===== ITENS DE NAVEGAÇÃO ===== */
    document.querySelectorAll('.nav-item').forEach(function(item) {
      item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(function(n) {
          n.classList.remove('nav-active');
        });
        this.classList.add('nav-active');

        const label = this.querySelector('span').textContent;
        showToast('Navegando para "' + label + '"...', 'compass');
      });
    });

    /* ===== INICIALIZAÇÃO DO PROGRESSO ===== */
    updateProgress();
