function alternarModoAuth(modo) {
    const toggle = document.querySelector('.toggle');

    if (toggle) {
        toggle.checked = modo === 'cadastro';
    }
}