class LoadingButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        button {
          position: relative !important;
          display: inline-flex ;
          align-items: center !important;
          justify-content: center !important;
          /*unstyled: inherit all styles from host[/user]*/
          all: unset;
          display: inline-flex !important;
        }
        button:disabled {
          cursor: not-allowed;
        }
        .spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 1em;
          height: 1em;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-right-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: none;
          box-sizing: border-box;
          transform-origin: center;
        }
        .hidden {
          visibility: hidden;
        }
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
      </style>
      <button part="button">
        <span class="spinner"></span>
        <span class="label"><slot></slot></span>
      </button>
    `;

    this._button = this.shadowRoot.querySelector('button');
    this._spinner = this.shadowRoot.querySelector('.spinner');
    this._label = this.shadowRoot.querySelector('.label');

    // forward classes
    this._button.className = this.className;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.attributeName === 'class') {
          this._button.className = this.className;
        }
      });
    });
    observer.observe(this, { attributes: true, attributeFilter: ['class'] });
  }

  static get observedAttributes() {
    return ['loading'];
  }

  attributeChangedCallback(name) {
    if (name === 'loading') {
      const isLoading = this.hasAttribute('loading');
      this._button.disabled = isLoading;
      this._spinner.style.display = isLoading ? 'block' : 'none';
      this._label.classList.toggle('hidden', isLoading);
    }
  }

  set loading(val) {
    if (val) this.setAttribute('loading', '');
    else this.removeAttribute('loading');
  }

  get loading() {
    return this.hasAttribute('loading');
  }
}

customElements.define('loading-button', LoadingButton);
