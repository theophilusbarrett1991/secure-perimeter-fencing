// ---- Settings -------------------------------------------------------------
// Where quote requests go.
var QUOTE_EMAIL = "secureperimeter2025@gmail.com";
// The form sends straight to QUOTE_EMAIL through formsubmit.co (free, no account).
// If sending ever fails, it falls back to opening the visitor's email app.
// Optional: a Web3Forms access key here is used instead of formsubmit.co.
var WEB3FORMS_KEY = "";
// ---------------------------------------------------------------------------

document.getElementById("yr").textContent = new Date().getFullYear();

// Fade sections in as they scroll into view
(function () {
  var els = document.querySelectorAll(".card,.use,.gallery figure,.steps li,.towns,.form,details");
  if (!("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    io.observe(el);
  });
})();

// Quote form
(function () {
  var form = document.getElementById("quoteForm");
  var msg = document.getElementById("formMsg");
  if (!form) return;

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var f = form.elements;
    if (f.company_website.value) return; // spam trap

    var ok = true;
    ["name", "phone", "location"].forEach(function (n) {
      var bad = !f[n].value.trim();
      f[n].classList.toggle("bad", bad);
      if (bad && ok) { f[n].focus(); ok = false; }
    });
    if (!ok) { msg.textContent = "Please fill in your name, phone and site location."; return; }

    var lines = [
      "Name: " + f.name.value.trim(),
      "Phone: " + f.phone.value.trim(),
      "Site location: " + f.location.value.trim(),
      "For: " + f.type.value,
      "Rough length: " + (f.length.value.trim() || "-"),
      "Dates: " + (f.dates.value.trim() || "-"),
      "Notes: " + (f.notes.value.trim() || "-")
    ];
    var subject = "Fencing quote request - " + f.location.value.trim();

    function openEmailApp() {
      window.location.href = "mailto:" + QUOTE_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      msg.textContent = "Your email app should open with the details filled in. Just press send. If nothing opens, call 07514 116277.";
    }

    var btn = form.querySelector("button[type=submit],button:not([type])");
    if (btn) btn.disabled = true;
    msg.textContent = "Sending…";

    var req = WEB3FORMS_KEY
      ? fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: subject, from_name: "Website quote form", message: lines.join("\n") })
        })
      : fetch("https://formsubmit.co/ajax/" + QUOTE_EMAIL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: subject, _template: "table", _captcha: "false",
            Name: f.name.value.trim(), Phone: f.phone.value.trim(), "Site location": f.location.value.trim(),
            For: f.type.value, "Panels or metres": f.length.value.trim() || "-",
            "Hire dates": f.dates.value.trim() || "-", Notes: f.notes.value.trim() || "-"
          })
        });

    req
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!(d.success === true || d.success === "true")) throw new Error();
        form.reset();
        msg.textContent = "Thanks, that's sent. We'll be in touch shortly.";
      })
      .catch(openEmailApp) // never lose an enquiry: fall back to the visitor's email app
      .then(function () { if (btn) btn.disabled = false; });
  });
})();
