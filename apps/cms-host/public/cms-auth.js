(() => {
  const SIGN_IN = 'cms:signin';
  const SIGN_OUT = 'cms:logout';
  const demoSession = {
    profile: { id: 'u1', name: 'Alex Rivera' },
    token: 'demo-cms-token',
  };

  const signInButton = document.getElementById('cms-signin');
  const signOutButton = document.getElementById('cms-signout');

  signInButton?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent(SIGN_IN, { detail: demoSession }));
  });

  signOutButton?.addEventListener('click', () => {
    window.dispatchEvent(new Event(SIGN_OUT));
  });
})();
