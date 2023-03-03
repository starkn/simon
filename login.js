function login() {
    const el = document.querySelector('#name');
    localStorage.setItem("userName", el.value);
    window.location.href = "play.html";
}