/* =====================================================================
   BEAN BOUTIQUE - the only script on the site.
   Two jobs: the shopping basket, and the on-page product search.
   Everything else (slideshow, hover, reveals) is CSS or a plugin.
   ===================================================================== */

(function () {
    "use strict";

    /* ---------- shopping basket ------------------------------------- */

    var KEY = "beanBoutiqueCart";

    function readCart() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function writeCart(items) {
        try {
            localStorage.setItem(KEY, JSON.stringify(items));
        } catch (e) {
            /* private browsing - the basket just won't be remembered */
        }
        paintCount();
    }

    function money(n) {
        return "$" + n.toFixed(2);
    }

    /* the little number next to CART in the header of every page */
    function paintCount() {
        var total = readCart().reduce(function (sum, item) {
            return sum + item.qty;
        }, 0);

        document.querySelectorAll(".cart-count").forEach(function (el) {
            el.textContent = total;
            el.hidden = total === 0;
        });
    }

    /* "Add to basket" buttons carry their product in data- attributes */
    document.querySelectorAll("[data-add]").forEach(function (button) {
        button.addEventListener("click", function () {
            var items = readCart();
            var id = button.getAttribute("data-id");
            var found = items.filter(function (i) { return i.id === id; })[0];

            if (found) {
                found.qty += 1;
            } else {
                items.push({
                    id: id,
                    name: button.getAttribute("data-name"),
                    price: parseFloat(button.getAttribute("data-price")),
                    img: button.getAttribute("data-img"),
                    qty: 1
                });
            }

            writeCart(items);

            button.textContent = "Added ✓";
            setTimeout(function () {
                button.textContent = "Add to basket";
            }, 1400);
        });
    });

    /* ---------- the basket page -------------------------------------- */

    var cartBody = document.getElementById("cart-body");

    function paintCart() {
        if (!cartBody) { return; }

        var items = readCart();
        var empty = document.getElementById("cart-empty");
        var panel = document.getElementById("cart-panel");

        if (!items.length) {
            if (empty) { empty.hidden = false; }
            if (panel) { panel.hidden = true; }
            return;
        }

        if (empty) { empty.hidden = true; }
        if (panel) { panel.hidden = false; }

        cartBody.innerHTML = "";
        var subtotal = 0;

        items.forEach(function (item, index) {
            subtotal += item.price * item.qty;

            var row = document.createElement("tr");
            row.innerHTML =
                '<td data-label="Item"><span class="cart-item">' +
                    '<img src="' + item.img + '" alt="">' +
                    '<span>' + item.name + '</span>' +
                '</span></td>' +
                '<td data-label="Price">' + money(item.price) + '</td>' +
                '<td data-label="Quantity">' +
                    '<label class="visually-hidden" for="qty-' + index + '">' +
                        'Quantity for ' + item.name +
                    '</label>' +
                    '<input class="qty" id="qty-' + index + '" type="number" ' +
                        'min="1" max="99" value="' + item.qty + '" ' +
                        'data-index="' + index + '">' +
                '</td>' +
                '<td data-label="Total">' + money(item.price * item.qty) + '</td>' +
                '<td><button class="link-remove" data-remove="' + index + '">' +
                    'Remove</button></td>';

            cartBody.appendChild(row);
        });

        var delivery = subtotal > 100 || subtotal === 0 ? 0 : 6.5;
        set("sum-subtotal", money(subtotal));
        set("sum-delivery", delivery ? money(delivery) : "Free");
        set("sum-total", money(subtotal + delivery));
    }

    function set(id, text) {
        var el = document.getElementById(id);
        if (el) { el.textContent = text; }
    }

    if (cartBody) {
        cartBody.addEventListener("click", function (event) {
            var index = event.target.getAttribute("data-remove");
            if (index === null) { return; }

            var items = readCart();
            items.splice(parseInt(index, 10), 1);
            writeCart(items);
            paintCart();
        });

        cartBody.addEventListener("change", function (event) {
            var index = event.target.getAttribute("data-index");
            if (index === null) { return; }

            var items = readCart();
            items[parseInt(index, 10)].qty = Math.max(1, parseInt(event.target.value, 10) || 1);
            writeCart(items);
            paintCart();
        });

        paintCart();
    }

    /* ---------- checkout ---------------------------------------------- */

    var checkout = document.getElementById("checkout");

    if (checkout) {
        checkout.addEventListener("click", function () {
            writeCart([]);

            var panel = document.getElementById("cart-panel");
            var done = document.getElementById("checkout-done");

            if (panel) { panel.hidden = true; }

            if (done) {
                done.hidden = false;
                done.focus();          /* so screen readers announce it */
            }
        });
    }

    /* ---------- on-page search --------------------------------------- */

    var searchInput = document.getElementById("site-search");

    if (searchInput) {
        var results = Array.prototype.slice.call(
            document.querySelectorAll("[data-search]")
        );
        var count = document.getElementById("search-count");
        var none = document.getElementById("search-empty");

        searchInput.addEventListener("input", function () {
            var term = searchInput.value.trim().toLowerCase();
            var shown = 0;

            results.forEach(function (item) {
                var hit = item.getAttribute("data-search")
                              .toLowerCase()
                              .indexOf(term) !== -1;

                item.classList.toggle("is-hidden", !hit);
                item.classList.toggle("is-shown", hit && term !== "");
                if (hit) { shown += 1; }
            });

            if (none) { none.hidden = shown !== 0; }

            if (count) {
                count.textContent = term === ""
                    ? ""
                    : shown + (shown === 1 ? " match" : " matches") +
                      ' for "' + searchInput.value.trim() + '"';
            }
        });
    }

    paintCount();
}());
