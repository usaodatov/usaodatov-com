/* Joshua's birthday invitation. Decorative 1234 PIN: not a security boundary. */
(() => {
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'j-invite-trigger';
  trigger.setAttribute('aria-label', "Open Joshua's birthday invitation");
  trigger.innerHTML = '<span class="j-envelope" aria-hidden="true"><span class="j-envelope-flap"></span><span class="j-seal">J</span></span><span class="j-whisper">Psst… click for Joshua’s invitation!</span>';
  const pinDialog = document.createElement('dialog');
  pinDialog.className = 'j-invite-dialog';
  pinDialog.setAttribute('aria-labelledby', 'j-pin-title');
  pinDialog.innerHTML = `
    <section class="j-panel">
      <span class="j-corner tl"></span><span class="j-corner tr"></span><span class="j-corner bl"></span><span class="j-corner br"></span>
      <button type="button" class="j-close" aria-label="Close invitation">×</button>
      <div class="j-stars" aria-hidden="true">✦ ✧ ✦</div>
      <p class="j-eyebrow">A little secret, just for you</p>
      <h2 id="j-pin-title">A special invitation</h2>
      <p class="j-pin-copy">Joshua has a surprise! Enter your four-digit secret code to open it.</p>
      <form id="j-pin-form">
        <label class="j-detail-label" for="j-pin">Your secret code</label>
        <input class="j-pin" id="j-pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" required aria-describedby="j-pin-error">
        <p id="j-pin-error" class="j-error" role="status" aria-live="polite" hidden>Oops! That’s not the secret code. Try again.</p>
        <button class="j-unlock" type="submit">Open my invitation ✦</button>
      </form>
    </section>`;
  const inviteDialog = document.createElement('dialog');
  inviteDialog.className = 'j-invite-dialog';
  inviteDialog.setAttribute('aria-labelledby', 'j-card-title');
  inviteDialog.innerHTML = `
    <article class="j-panel">
      <span class="j-corner tl"></span><span class="j-corner tr"></span><span class="j-corner bl"></span><span class="j-corner br"></span>
      <button type="button" class="j-close" aria-label="Close invitation">×</button>
      <p class="j-eyebrow">A very special invitation</p>
      <div class="j-stars" aria-hidden="true">✦ ✧ ✦</div>
      <p class="j-card-lead">You're invited to celebrate…</p>
      <h2 class="j-party-name" id="j-card-title">Joshua's<br>8th Birthday!</h2>
      <div class="j-stars" aria-hidden="true">✧ 🍕 ✧</div>
      <p class="j-card-body">Little chefs, big fun!<br>Roll the dough, choose your toppings<br>and make your very own pizza.</p>
      <div class="j-divider"></div>
      <p class="j-detail-label">Save the date</p>
      <p class="j-details"><strong>Sunday, 25 October 2026</strong><br>12 noon – 2 pm</p>
      <p class="j-detail-label">Join us at</p>
      <p class="j-details"><strong>PizzaExpress</strong></p>
      <p class="j-address">Bridge House<br>4 Borough High Street<br>London SE1 9QQ</p>
      <a class="j-map" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&amp;query=PizzaExpress%20Bridge%20House%204%20Borough%20High%20Street%20London%20SE1%209QQ">Find the pizza party ↗</a>
      <div class="j-rsvp">
        <p class="j-detail-label">Kindly RSVP to</p>
        <p class="j-rsvp-name">Magdalena</p>
        <a class="j-rsvp-phone" href="tel:+447429337638" aria-label="Call or text Magdalena on 07429 337638">07429 337638</a>
      </div>
      <p class="j-allergy">Please let Magdalena know about any allergies or dietary requirements.</p>
      <div class="j-stars" aria-hidden="true">✦ ✧ ✦</div>
    </article>`;
  document.body.append(trigger, pinDialog, inviteDialog);
  const pinInput = pinDialog.querySelector('#j-pin');
  const error = pinDialog.querySelector('#j-pin-error');
  function openPin() {
    pinInput.value = '';
    error.hidden = true;
    trigger.classList.add('is-opened');
    pinDialog.showModal();
    pinInput.focus();
  }
  trigger.addEventListener('click', openPin);
  pinDialog.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (pinInput.value === '1234') {
      pinDialog.close();
      inviteDialog.showModal();
    } else {
      error.hidden = false;
      pinInput.value = '';
      pinInput.focus();
    }
  });
  pinInput.addEventListener('input', () => {
    pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 4);
    error.hidden = true;
  });
  [pinDialog, inviteDialog].forEach((dialog) => {
    dialog.querySelector('.j-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!pinDialog.open && !inviteDialog.open) trigger.classList.remove('is-opened');
    });
  });
})();
