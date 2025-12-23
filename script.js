document.addEventListener("DOMContentLoaded", function () {
  var SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbxNx3UWerZaHJE_f53Lpnu2Gf3F80v-jena1TlXHaJQ7bd4hlSGbo8_HEaOgByRmcL0/exec";
  var SHEETS_TOKEN = "riol-avto-demo-2025";
  var PHONE_MAX_LEN = 12; 

  var faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq-item__question");
    var answer = item.querySelector(".faq-item__answer");
    if (!btn || !answer) return;

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("faq-item--open");

      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("faq-item--open");
          var otherAnswer = other.querySelector(".faq-item__answer");
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      if (!isOpen) {
        item.classList.add("faq-item--open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      } else {
        item.classList.remove("faq-item--open");
        answer.style.maxHeight = null;
      }
    });
  });

  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href");
      if (!href || href === "#") return;

      var targetId = href.substring(1);
      var target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  var bookingForm = document.querySelector(".booking-form");
  if (!bookingForm) return;

  var submitBtn = bookingForm.querySelector('button[type="submit"]');

  var phoneInput = bookingForm.elements["phone"];
  if (phoneInput) {
    phoneInput.setAttribute("inputmode", "numeric");
    phoneInput.setAttribute("autocomplete", "tel");
    phoneInput.setAttribute("placeholder", PHONE_MAX_LEN === 10 ? "Напр. 0991234567" : "Напр. 380991234567");

    phoneInput.addEventListener("input", function () {
      var digits = this.value.replace(/\D/g, "");
      if (digits.length > PHONE_MAX_LEN) digits = digits.slice(0, PHONE_MAX_LEN);
      this.value = digits;
    });

    phoneInput.addEventListener("paste", function (e) {
      e.preventDefault();
      var text = (e.clipboardData || window.clipboardData).getData("text") || "";
      var digits = String(text).replace(/\D/g, "");
      if (digits.length > PHONE_MAX_LEN) digits = digits.slice(0, PHONE_MAX_LEN);
      this.value = digits;
    });
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Відправляємо..." : "Надіслати заявку";
  }

  function collectFormData() {
    return {
      name: (bookingForm.elements["name"]?.value || "").trim(),
      phone: (bookingForm.elements["phone"]?.value || "").trim(),
      car_type: (bookingForm.elements["car_type"]?.value || "").trim(),
      service: (bookingForm.elements["service"]?.value || "").trim(),
      comment: (bookingForm.elements["comment"]?.value || "").trim()
    };
  }

  function validate(data) {
    if (!data.name || !data.phone) return false;
    if (data.phone.length < 9) return false;
    return true;
  }

  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.indexOf("http") !== 0) {
      alert("Не налаштовано endpoint для Google Sheets. Додай URL Apps Script у SHEETS_ENDPOINT.");
      return;
    }

    var data = collectFormData();

    if (!validate(data)) {
      alert("Будь ласка, коректно заповніть обов’язкові поля: Ім’я та Телефон (тільки цифри).");
      return;
    }

    var params = new URLSearchParams();
    params.append("token", SHEETS_TOKEN);
    params.append("name", data.name);
    params.append("phone", data.phone);
    params.append("car_type", data.car_type);
    params.append("service", data.service);
    params.append("comment", data.comment);

    setLoading(true);
    fetch(SHEETS_ENDPOINT, {
      method: "POST",
      body: params
    })
      .then(function (r) {
        return r.json().catch(function () { return { ok: true }; });
      })
      .then(function (res) {
        if (res && res.ok === false) {
          alert("Помилка запису в таблицю: " + (res.error || "невідома"));
          return;
        }

        alert("Заявка збережена ✅ Менеджер зв’яжеться з вами найближчим часом.");
        bookingForm.reset();
      })
      .catch(function (err) {
        console.error(err);
        alert("Не вдалося зберегти заявку. Спробуйте ще раз.");
      })
      .finally(function () {
        setLoading(false);
      });
  });
});