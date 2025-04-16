document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.querySelector("#isColoring");
  const pBox = document.querySelector(".textPrint");
  const coloringBox = document.querySelector(".coloringBox");
  const cPicker = document.querySelector("#cPicker");
  const bgImg = document.querySelector("#bgImg");
  const foldable = document.querySelector(".foldable");
  const handle = foldable.querySelector(".handle");
  const outputDiv = document.getElementById("output");
  const btnArea = document.querySelector("#users");
  const detailArea = document.querySelector("#details");

  let result = [];
  let nameList = [];
  let uniqueNames = [];

  checkbox.addEventListener("change", () => {
    pBox.innerText = checkbox.checked ? "✅ 체크됨!" : "❌ 체크 해제됨!";
    coloringBox.style.display = checkbox.checked ? "block" : "none";
    if (!checkbox.checked) {
      outputDiv.style.background = "var(--previewBackground, #B2C7D9)";
    }
  });

  cPicker.addEventListener("input", () => {
    outputDiv.style.background = cPicker.value;
  });

  bgImg.addEventListener("input", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      outputDiv.style.background = `url("${e.target.result}") no-repeat center / cover`;
    };
    reader.readAsDataURL(file);
  });

  handle.addEventListener("click", () => {
    foldable.classList.toggle("open");
    handle.innerText = foldable.classList.contains("open") ? "close" : "open";
  });

  function parseText() {
    outputDiv.innerHTML = "";
    const messages = document.getElementById("inputText").value.split("\n");
    result = [];
    let current = null;

    messages.forEach((msg) => {
      const match = msg.match(/\[([^\]]+)\] (.+)/);
      if (match) {
        if (current) result.push(current);
        current = { name: match[1], time: match[2], messages: [] };
      } else if (current && msg.trim()) {
        current.messages.push(msg.trim());
      }
    });
    if (current) result.push(current);

    result.forEach((el) => {
      const nameDiv = document.createElement("div");
      const img = document.createElement("img");
      const texts = document.createElement("div");

      img.src = "sample.jpg";
      nameDiv.appendChild(img);
      nameDiv.innerHTML += el.name;
      nameDiv.classList.add("name", el.name);
      texts.classList.add("texts");

      el.messages.forEach((msg, i) => {
        const p = document.createElement("p");
        const wrapper = document.createElement("div");

        if (msg === "@사진") {
          const input = document.createElement("input");
          input.type = "file";
          input.name = "photo";
          input.accept = "image/*";
          input.classList.add("photos");
          input.multiple = true;
          input.addEventListener("change", handlePhotoUpload);
          p.appendChild(input);
        } else {
          p.innerText = msg;
        }

        if (i === el.messages.length - 1) {
          const time = document.createElement("span");
          time.innerText = el.time;
          wrapper.appendChild(p);
          wrapper.appendChild(time);
          texts.appendChild(wrapper);
          if (el.messages.length > 1) p.classList.add("endLine");
        } else {
          texts.appendChild(p);
        }
      });

      outputDiv.appendChild(nameDiv);
      outputDiv.appendChild(texts);

      nameList.push(el.name);
    });

    userMaker();
  }

  function handlePhotoUpload(event) {
    const files = event.target.files;
    const container = document.createElement("div");
    container.classList.add("photos");

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          container.appendChild(img);
          event.target.parentElement.appendChild(container);
        };
        reader.readAsDataURL(file);
      }
    });

    event.target.style.display = "none";
    event.target.parentElement.style.padding = "0";
  }

  function test(name) {
    const names = document.querySelectorAll(".name");
    names.forEach((el) => {
      const isMatch = el.innerText === name;
      el.classList.toggle("right", isMatch);
      el.nextSibling.classList.toggle("right", isMatch);
    });
    setupProfileImageChange(name);
  }

  function setupProfileImageChange(targetName) {
    const input = document.querySelector(`#profile_${targetName}`);
    if (!input) return;

    input.addEventListener(
      "change",
      (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          document.querySelectorAll(`.${targetName} img`).forEach((img) => {
            img.src = e.target.result;
          });
        };
        reader.readAsDataURL(file);
      },
      { once: true }
    ); // 한 번만 바인딩
  }

  function userMaker() {
    uniqueNames = [...new Set(result.map((item) => item.name))];
    btnArea.innerHTML = "";

    uniqueNames.forEach((el, i) => {
      const userDiv = document.createElement("div");
      userDiv.classList.add("user");

      userDiv.innerHTML = `
        <div class="users--left">
          <input type="radio" name="btn__makeMe" id="btn__makeMe_${el}" value="${el}" class="btn__makeMe">
          <label for="btn__makeMe_${el}">'나'로 만들기</label>
          <label for="user${i}" class="${el}">
            <img src="sample.jpg" class="profileImg">
            <h3>${el}</h3>
            <input type="text" value="${el}" disabled>
          </label>
        </div>
        <div class="users--right">
          <label for="profile_${el}">이미지 변경</label>
          <input type="file" id="profile_${el}" class="profileInput" accept="image/*">
        </div>
      `;

      btnArea.appendChild(userDiv);

      // 이벤트 바인딩
      const radio = userDiv.querySelector(`#btn__makeMe_${el}`);
      radio.addEventListener("change", () => test(el));

      const profileInput = userDiv.querySelector(`#profile_${el}`);
      profileInput.addEventListener("click", () => setupProfileImageChange(el));
    });
  }

  parseText();
});
