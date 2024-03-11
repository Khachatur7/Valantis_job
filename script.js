let page = +new URLSearchParams(location.search).get("page") ?? 1;
const Url = "https://api.valantis.store:41000/";
const password = "Valantis";
const timestamp = new Date().toISOString().slice(0, 10).split("-").join("");
const data = `${password}_${timestamp}`;
const authText = CryptoJS.MD5(data).toString();
let offsetCount = page > 1 ? page * 50 : 0;
let filter_button = document.getElementById("filter_prodList");
let loading = document.getElementById("loading");

function getIds(url, auth) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth": auth,
    },
    body: JSON.stringify({
      action: "get_ids",
    }),
  });
}

function getItems(url, auth, id) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth": auth,
    },
    body: JSON.stringify({
      action: "get_items",
      params: { ids: [...id] },
    }),
  });
}

let unicProd = [];

function CreateProducts(parent, childrens) {
  let parentElement = document.getElementById(parent);
  parentElement.innerHTML = "";
  loading.style.display = "block";
  if (childrens.length == 0) {
    ShowError(parentElement);
  }
  for (let i = offsetCount; i < childrens.length; i++) {
    if (parentElement.childNodes.length == 50) {
      CreatePages(childrens);
      break;
    } else {
      if (!unicProd.includes(childrens[i].id)) {
        unicProd.push(childrens[i].id);
        let childElement = document.createElement("div");
        childElement.className = "product";
        childElement.id = childrens[i].id;
        childElement.innerHTML = `<div class="img">
      <div class="hover">
        <div class="like">
          <svg
            width="40px"
            height="40px"
            viewBox="0 0 48 48"
            id="b"
            xmlns="http://www.w3.org/2000/svg">
            <path
              class="c"
              d="m43,17.0766c0-5.6539-4.5835-10.2373-10.2374-10.2373-3.7223,0-6.9708,1.9932-8.7626,4.964-1.7919-2.9708-5.0403-4.964-8.7626-4.964-5.6539,0-10.2373,4.5834-10.2373,10.2373,0,1.2925.2496,2.524.6866,3.6627,3.3851,9.7368,18.3134,20.4215,18.3134,20.4215,0,0,14.9282-10.6847,18.3134-20.4215.437-1.1386.6867-2.3702.6867-3.6627Z"
            />
          </svg>
        </div>
      </div>
    </div>
    <div class="brand_info">
      <span class="name">${childrens[i].product}</span>
      <span class="brand">${
        childrens[i].brand ? childrens[i].brand : "Ditlis"
      }</span>
      <span class="price">${childrens[i].price}<i> руб</i></span>
    </div>`;
        parentElement.appendChild(childElement);
      }
    }
  }
}

function CreatePages(childrens) {
  let pagesCount = Math.floor(childrens.length / 50 + 2);
  let pagesParent = document.getElementById("pages");
  pagesParent.innerHTML = "";
  let iteratorNumber = page > 5 ? page - 5 : 0;
  let lengthValue = page > 5 && page + 5 <= pagesCount ? page + 5 : 12;
  for (let n = iteratorNumber; n < lengthValue; n++) {
    let page_link = document.createElement("li");
    page_link.className =
      page == n && page != 0 ? "pages_item active" : "pages_item";
    if (n == iteratorNumber) {
      if (page > 1) {
        page_link.innerHTML = `<a class="pages_link" href="${
          location.pathname
        }?page=${page - 1}">Previous</a>`;
      } else {
        page_link.innerHTML = `<a class="pages_link" href="javascript:void(0)">Previous</a>`;
      }
    } else if (n > iteratorNumber && n + 1 < lengthValue) {
      page_link.innerHTML = `<a class="pages_link" href="${location.pathname}?page=${n}">${n}</a>`;
    } else {
      if (n + 1 < lengthValue) {
        page_link.innerHTML = `<a class="pages_link" href="${
          location.pathname
        }?page=${page + 1}">Next</a>`;
      } else {
        page_link.innerHTML = `<a class="pages_link" href="javascript:void(0)">Next</a>`;
      }
    }
    pagesParent.append(page_link);
  }
}

function ShowError(parentElement) {
  let pagesParent = document.getElementById("pages");
  pagesParent.innerHTML = "";
  console.log(pagesParent.innerHTML);
  let notFound = document.createElement("h2");
  notFound.innerHTML = "Не найдено";
  parentElement.append(notFound);
}

function FilterProdList() {
  let name = document.getElementById("name").value.toLowerCase();
  let brand = document.getElementById("brand").value.toLowerCase();
  let price_items = document.querySelectorAll(".price_item>input");
  let resPrice = [];
  price_items.forEach((inpt) => {
    if (inpt.checked) {
      resPrice.push(inpt.value.split(" - "));
    }
  });
  resPrice = resPrice.flat(2);

  getIds(Url, authText)
    .then((res) => res.json())
    .then((res) => {
      loading.style.display = "block";
      let unicIds = [];
      res.result.filter((prod, index, arr) => {
        if (arr.indexOf(prod) == index) {
          unicIds.push(prod);
        }
      });
      getItems(Url, authText, res.result)
        .then((res) => res.json())
        .then((res) => {
          let filtredProd = [];
          res.result.filter((prod) => {
            let checkName = prod.product.toLowerCase().includes(name);
            let checkBrand = prod.brand
              ? prod.brand.toLowerCase().includes(brand)
              : "DItlis";
            let checkMinPrice;
            let checkMaxPrice;
            if (resPrice[0] != 100000) {
              checkMinPrice = prod.price > resPrice[0];
              checkMaxPrice = prod.price < resPrice[resPrice.length - 1];
            } else {
              checkMinPrice = prod.price > resPrice[0];
              checkMaxPrice = prod.price > resPrice[0];
            }

            if (checkName && checkBrand && checkMinPrice && checkMaxPrice) {
              filtredProd.push(prod);
            }
          });
          CreateProducts("products", filtredProd);
          loading.style.display = "none";
        })
        .catch((err) => {
          console.log(err);
          return getIds(Url, authText);
        });
    })
    .catch((err) => {
      console.log(err);
      return getIds(Url, authText);
    });
}

getIds(Url, authText)
  .then((res) => res.json())
  .then((res) => {
    loading.style.display = "block";
    let unicIds = [];
    res.result.filter((prod, index, arr) => {
      if (arr.indexOf(prod) == index) {
        unicIds.push(prod);
      }
    });
    getItems(Url, authText, res.result)
      .then((res) => res.json())
      .then(async (res) => {
        CreateProducts("products", res.result);
        loading.style.display = "none";
      })
      .catch((err) => {
        console.log(err);
        return getIds(Url, authText);
      });
  })
  .catch((err) => {
    console.log(err);
    return getIds(Url, authText);
  });


filter_button.addEventListener("click", FilterProdList);