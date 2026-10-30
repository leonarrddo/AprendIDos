const statusMessages = {
  received: 'Solicitação recebida. Ela aguarda a conferência da identidade da conta e da autorização antes de qualquer exclusão.',
  in_review: 'Solicitação em análise. A identidade e os dados associados estão sendo conferidos.',
  completed: 'A análise foi concluída e a exclusão autorizada foi registrada como concluída.',
  action_required: 'A solicitação precisa de uma verificação adicional antes de poder continuar.'
};

const statusElement = document.getElementById('statusSolicitacao');
const codeElement = document.getElementById('codigoConfirmacao');
const confirmationCode = new URLSearchParams(window.location.search).get('code');

if (codeElement) codeElement.textContent = confirmationCode || 'Não informado';

if (statusElement) {
  if (!confirmationCode) {
    statusElement.textContent = 'Informe o código recebido pela Meta no endereço de status para consultar uma solicitação.';
  } else {
    fetch(`/api/facebook-data-deletion-status?code=${encodeURIComponent(confirmationCode)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Não foi possível consultar o status.');
        statusElement.textContent = statusMessages[result.status] || 'O status recebido não é reconhecido. Entre em contato com o responsável pelo AprendIDos.';
      })
      .catch(() => {
        statusElement.textContent = 'Não foi possível consultar o status agora. Tente novamente mais tarde e mantenha seu código de confirmação.';
      });
  }
}
