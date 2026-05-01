// Endereço da API — mude aqui quando fizer deploy
const API_URL = 'https://orbita-backend-jlqp.onrender.com';

/* ================================================
   app.js — JavaScript compartilhado do Orbita

   Este arquivo é importado em TODAS as páginas
   com a tag (antes do </body>):
   <script src="app.js"></script>

   Aqui ficam funções utilitárias que são
   reutilizadas em várias páginas.
================================================ */


/* ================================================
   1. TOAST — notificação temporária
   
   Uso em qualquer página:
   Orbita.toast('Mensagem aqui!')
   Orbita.toast('Erro!', 'error')
   Orbita.toast('Sucesso!', 'success')
================================================ */

// "Orbita" é um objeto (namespace) que agrupa
// todas as funções compartilhadas.
// Isso evita conflitos com outras variáveis.
const Orbita = {

  toast(msg, tipo = 'default') {
    // Remove toasts existentes para não acumular
    document.querySelectorAll('.orbita-toast')
            .forEach(t => t.remove());

    // Define a cor conforme o tipo
    const cores = {
      default: 'var(--surface)',
      success: 'rgba(90,255,184,0.15)',
      error:   'rgba(255,90,90,0.15)',
      accent:  'rgba(232,255,90,0.15)',
    };

    const bordas = {
      default: 'var(--border)',
      success: 'rgba(90,255,184,0.3)',
      error:   'rgba(255,90,90,0.3)',
      accent:  'rgba(232,255,90,0.3)',
    };

    // Cria o elemento do toast
    const toast = document.createElement('div');
    toast.className = 'orbita-toast';
    toast.textContent = msg;

    // Aplica os estilos via JavaScript
    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '28px',
      left:         '50%',
      transform:    'translateX(-50%) translateY(16px)',
      background:   cores[tipo] || cores.default,
      border:       `1px solid ${bordas[tipo] || bordas.default}`,
      backdropFilter: 'blur(8px)',
      color:        'var(--text)',
      padding:      '10px 22px',
      borderRadius: '999px',
      fontSize:     '0.85rem',
      fontFamily:   'var(--font-body, DM Sans, sans-serif)',
      zIndex:       '9999',
      opacity:      '0',
      transition:   'all 0.3s ease',
      whiteSpace:   'nowrap',
      pointerEvents: 'none',
    });

    document.body.appendChild(toast);

    // Anima a entrada
    // requestAnimationFrame garante que a transição
    // CSS funcione ao adicionar elementos dinamicamente
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });
    });

    // Remove após 2.5 segundos
    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  },


  /* ================================================
     2. MODAL
     
     Uso:
     Orbita.modal.abrir('id-do-modal')
     Orbita.modal.fechar('id-do-modal')
  ================================================ */
  modal: {
    abrir(id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('open');
    },

    fechar(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('open');
    },

    // Fecha ao clicar fora (no overlay)
    // Chame assim no overlay:
    // onclick="Orbita.modal.fecharSeOverlay(event)"
    fecharSeOverlay(event) {
      if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('open');
      }
    },
  },


  /* ================================================
     3. VALIDAÇÃO DE FORMULÁRIOS
     
     Uso:
     Orbita.validar.email('teste@email.com') // true/false
     Orbita.validar.campo('meu-input')       // true/false
     Orbita.validar.senha('minhasenha123')   // { valido, forca }
  ================================================ */
  validar: {

    // Verifica se o e-mail tem formato válido
    email(valor) {
      // Regex = padrão de texto
      // /^...$/  = início e fim da string
      // [^\s@]+  = um ou mais chars que não são espaço ou @
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(valor);
    },

    // Verifica se um campo não está vazio
    // Marca visualmente o erro se inválido
    campo(inputId, errorId) {
      const input = document.getElementById(inputId);
      const error = errorId ? document.getElementById(errorId) : null;
      const valido = input && input.value.trim().length > 0;

      if (input) {
        input.classList.toggle('error', !valido);
      }
      if (error) {
        error.classList.toggle('visible', !valido);
      }

      return valido;
    },

    // Avalia a força de uma senha
    // Retorna: { forca: 0-4, nivel: 'fraca'|... }
    senha(valor) {
      const criterios = [
        valor.length >= 8,           // tem tamanho mínimo?
        /[A-Z]/.test(valor),         // tem maiúscula?
        /[0-9]/.test(valor),         // tem número?
        /[^A-Za-z0-9]/.test(valor),  // tem símbolo?
      ];

      // filter(Boolean) conta quantos são "true"
      const forca = criterios.filter(Boolean).length;

      const niveis = ['', 'fraca', 'média', 'boa', 'forte'];
      return { forca, nivel: niveis[forca] };
    },
  },


  /* ================================================
     4. FORMATAÇÃO
     
     Uso:
     Orbita.format.numero(3420)      // "3.420"
     Orbita.format.tempo(new Date()) // "agora mesmo"
  ================================================ */
  format: {

    // Formata número com separador de milhar
    numero(n) {
      return n.toLocaleString('pt-BR');
    },

    // Formata data relativa ("há 2min", "há 3h", etc.)
    tempo(data) {
      // Se receber uma string, converte para Date
      if (typeof data === 'string') data = new Date(data);

      // Diferença em milissegundos
      const diff = Date.now() - data.getTime();

      // Converte para unidades legíveis
      const min  = Math.floor(diff / 60000);
      const hora = Math.floor(diff / 3600000);
      const dia  = Math.floor(diff / 86400000);

      if (min  <  1)  return 'agora mesmo';
      if (min  < 60)  return `há ${min}min`;
      if (hora < 24)  return `há ${hora}h`;
      if (dia  <  7)  return `há ${dia} dia${dia > 1 ? 's' : ''}`;

      // Para datas mais antigas, formata como "15 mar"
      return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    },
  },


  /* ================================================
     5. ARMAZENAMENTO LOCAL
     Salva dados no navegador do usuário.
     Persiste mesmo após fechar o navegador.
     
     Uso:
     Orbita.store.salvar('usuario', { nome: 'João' })
     Orbita.store.ler('usuario')     // { nome: 'João' }
     Orbita.store.remover('usuario')
  ================================================ */
  store: {

    // Salva dado (qualquer tipo) no localStorage
    // JSON.stringify converte objeto/array para texto
    salvar(chave, valor) {
      try {
        localStorage.setItem('orbita_' + chave, JSON.stringify(valor));
        return true;
      } catch (e) {
        console.warn('Erro ao salvar:', e);
        return false;
      }
    },

    // Lê dado do localStorage
    // JSON.parse converte texto de volta para objeto/array
    ler(chave) {
      try {
        const item = localStorage.getItem('orbita_' + chave);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        return null;
      }
    },

    // Remove um dado
    remover(chave) {
      localStorage.removeItem('orbita_' + chave);
    },
  },


  /* ================================================
     6. AUTENTICAÇÃO SIMULADA
     Em produção, isso seria substituído por
     chamadas reais à API do backend.
     
     Uso:
     Orbita.auth.login('email', 'senha')
     Orbita.auth.estaLogado()      // true/false
     Orbita.auth.usuario()         // { nome, email, ... }
     Orbita.auth.logout()
  ================================================ */
  auth: {

    login(email, senha) {
      // Simulação: qualquer e-mail/senha válidos funcionam
      // Na versão real: fetch('/api/login', { method: 'POST', body: ... })
      const usuario = {
        id:     1,
        nome:   'João Silva',
        handle: '@joaosilva',
        email:  email,
        avatar: '🧑‍💻',
      };

      // Salva no armazenamento local
      Orbita.store.salvar('usuario', usuario);
      Orbita.store.salvar('logado', true);

      return usuario;
    },

    logout() {
      Orbita.store.remover('usuario');
      Orbita.store.remover('logado');
      window.location.href = 'login.html';
    },

    estaLogado() {
      return Orbita.store.ler('logado') === true;
    },

    usuario() {
      return Orbita.store.ler('usuario');
    },
  },


  /* ================================================
     7. UTILITÁRIOS GERAIS
  ================================================ */

  // Copia texto para a área de transferência
  copiar(texto, msgSucesso = 'Copiado! 📋') {
    navigator.clipboard.writeText(texto)
      .then(() => Orbita.toast(msgSucesso, 'success'))
      .catch(() => Orbita.toast('Erro ao copiar', 'error'));
  },

  // Rola suavemente até um elemento
  rolarAte(seletor) {
    const el = document.querySelector(seletor);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // Debounce: evita chamar uma função muitas vezes
  // seguidas (útil para campos de busca)
  // Uso: const buscar = Orbita.debounce(minhaFuncao, 300)
  debounce(fn, delay = 300) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },
};


/* ================================================
   INICIALIZAÇÃO AUTOMÁTICA
   Roda quando a página termina de carregar.
================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Fecha modais com a tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open')
              .forEach(m => m.classList.remove('open'));
    }
  });

  // Fecha modal ao clicar no overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // Marca o link da navbar como ativo
  // baseado na página atual
  const paginaAtual = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-btn, .nav-link, .menu-item').forEach(link => {
    if (link.getAttribute('href') === paginaAtual) {
      link.classList.add('active');
    }
  });

});