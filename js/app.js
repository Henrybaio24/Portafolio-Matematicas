import { initAppController } from './core/appController.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppController);
} else {
  initAppController();
}
