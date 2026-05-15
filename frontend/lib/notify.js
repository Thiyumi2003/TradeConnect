export function showNotification(message, type = 'success') {
  const event = new CustomEvent('notify', {
    detail: { message, type },
  });
  window.dispatchEvent(event);
}

export function showSuccess(message) {
  showNotification(message, 'success');
}

export function showError(message) {
  showNotification(message, 'error');
}
