
/* FoodBridge - Interactive Food Platform */

const defaultFoods = [
    {
        id: 1,
        name: "Freshly Baked Bread",
        store: "Green Leaf Bakery",
        region: "Taipei",
        category: "Bakery",
        originalPrice: 65,
        stock: 5,
        weight: 0.25,
        pickup: "5:00 PM - 7:00 PM",
        image: "green-leaf.jpg"
    },
    {
        id: 2,
        name: "Assorted Pastries",
        store: "Sweetbread Bakery",
        region: "New Taipei",
        category: "Bakery",
        originalPrice: 90,
        stock: 4,
        weight: 0.30,
        pickup: "6:00 PM - 8:00 PM",
        image: "sweetbread.jpg"
    },
    {
        id: 3,
        name: "Traditional Bento",
        store: "Sunny Bento Shop",
        region: "Tainan",
        category: "Meals",
        originalPrice: 110,
        stock: 5,
        weight: 0.45,
        pickup: "5:00 PM - 7:00 PM",
        image: "sunny-bento.jpg"
    }
].map(food => ({
    ...food,
    price: Math.round(food.originalPrice * 0.3)
}));

/* Initialize Data */

const storageKey = "foodbridge_v5";

let foods = defaultFoods.map(food => ({ ...food }));

let impact = {
    meals: 0,
    waste: 0,
    money: 0
};

/* Load Saved Data */

try {
    const saved = JSON.parse(
        localStorage.getItem(storageKey)
    );

    if (saved && saved.stock) {
        foods.forEach(food => {
            const stock = saved.stock[food.id];

            if (
                Number.isInteger(stock) &&
                stock >= 0 &&
                stock <= food.stock
            ) {
                food.stock = stock;
            }
        });
    }
} catch (error) {
    console.warn("Unable to load saved data.");
}

/* HTML Elements */

const foodList =
    document.getElementById("foodList");

const searchInput =
    document.getElementById("searchInput");

const regionFilter =
    document.getElementById("regionFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const message =
    document.getElementById("message");

const contactForm =
    document.getElementById("contactForm");

const contactStatus =
    document.getElementById("contactStatus");

/* Display Food Cards */

function displayFoods(items) {

    foodList.innerHTML = "";

    if (items.length === 0) {

        foodList.innerHTML = `
            <div class="empty-state">
                <h3>No matching meals</h3>
                <p>Try another search or change your filters.</p>
            </div>
        `;

        return;
    }

    items.forEach(food => {

        const discount = Math.round(
            (1 - food.price / food.originalPrice) * 100
        );

        const card = document.createElement("article");

        card.className = "food-card";

        card.innerHTML = `
            <div class="food-image">

                <img
                    src="${food.image}"
                    alt="${food.name}"
                    loading="lazy"
                >

            </div>

            <div class="food-content">

                <span class="stock">
                    ${food.stock > 0
                        ? food.stock + " available"
                        : "Sold out"}
                </span>

                <h3>${food.name}</h3>

                <p>${food.store}</p>

                <p>${food.region} · ${food.category}</p>

                <p>Pickup: ${food.pickup}</p>

                <span class="photo-note">
                    Illustrative photo
                </span>

                <div class="price-row">

                    <span class="price">
                        NT$${food.price}
                    </span>

                    <span class="original-price">
                        NT$${food.originalPrice}
                    </span>

                    <span class="discount-badge">
                        ${discount}% OFF
                    </span>

                </div>

                <button
                    class="reserve-btn"
                    data-id="${food.id}"
                    ${food.stock === 0 ? "disabled" : ""}
                >
                    ${food.stock > 0
                        ? "Reserve"
                        : "Sold Out"}
                </button>

            </div>
        `;

        foodList.appendChild(card);
    });
}

/* Search and Filter */

function filterFoods() {

    const keyword =
        searchInput.value.toLowerCase().trim();

    const region = regionFilter.value;

    const category = categoryFilter.value;

    const filteredFoods = foods.filter(food => {

        const matchesKeyword =
            food.name.toLowerCase().includes(keyword) ||
            food.store.toLowerCase().includes(keyword);

        const matchesRegion =
            region === "all" ||
            food.region === region;

        const matchesCategory =
            category === "all" ||
            food.category === category;

        return (
            matchesKeyword &&
            matchesRegion &&
            matchesCategory
        );
    });

    displayFoods(filteredFoods);
}

/* Reservation Preview */

function reserveFood(id) {

    const food = foods.find(item => item.id === id);

    if (!food || food.stock <= 0) {
        showMessage("This item is no longer available.");
        return;
    }

    const discount = Math.round(
        (1 - food.price / food.originalPrice) * 100
    );

    const confirmed = window.confirm(

        food.name + "\n\n" +

        "Store: " + food.store + "\n" +

        "Original Price: NT$" + food.originalPrice + "\n" +

        "Special Price: NT$" + food.price + "\n" +

        "Discount: " + discount + "% OFF\n" +

        "Pickup: " + food.pickup + "\n\n" +

        "Continue with reservation preview?\n" +

        "No order or payment will be sent to the store."
    );

    if (!confirmed) {
        return;
    }

    food.stock -= 1;

    saveData();

    filterFoods();

    updateImpact();

    showMessage(
        food.name +
        " selected. Reservation preview completed."
    );
}

/* Environmental Impact */

function updateImpact() {

    impact = {
        meals: 0,
        waste: 0,
        money: 0
    };

    foods.forEach(food => {

        const original = defaultFoods.find(
            item => item.id === food.id
        );

        const reserved = original.stock - food.stock;

        impact.meals += reserved;

        impact.waste += reserved * food.weight;

        impact.money +=
            reserved * (food.originalPrice - food.price);
    });

    document.getElementById("savedMeals")
        .textContent = impact.meals;

    document.getElementById("savedWaste")
        .textContent = impact.waste.toFixed(2);

    document.getElementById("savedMoney")
        .textContent = impact.money.toLocaleString("en-US");
}

/* Save Data */

function saveData() {

    const stock = {};

    foods.forEach(food => {
        stock[food.id] = food.stock;
    });

    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify({ stock: stock })
        );
    } catch (error) {
        console.warn("Unable to save data.");
    }
}

/* Notifications */

let messageTimer;

function showMessage(text) {

    clearTimeout(messageTimer);

    message.textContent = text;

    messageTimer = setTimeout(() => {
        message.textContent = "";
    }, 6000);
}

/* Store Links */

document.querySelectorAll("[data-store]")
    .forEach(link => {

        link.addEventListener("click", () => {

            searchInput.value = link.dataset.store;

            regionFilter.value = "all";

            categoryFilter.value = "all";

            filterFoods();
        });
    });

/* Contact Form */

contactForm.addEventListener("submit", event => {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const feedback =
        document.getElementById("feedback").value.trim();

    if (!name || !email || !feedback) {

        contactStatus.textContent =
            "Please complete all fields.";

        return;
    }

    window.alert(

        "Message Preview\n\n" +

        "Name: " + name + "\n" +

        "Email: " + email + "\n\n" +

        feedback
    );

    contactStatus.textContent =
        "Your message is ready. Online messaging is coming soon.";
});

/* Event Listeners */

searchInput.addEventListener("input", filterFoods);

regionFilter.addEventListener("change", filterFoods);

categoryFilter.addEventListener("change", filterFoods);

foodList.addEventListener("click", event => {

    const button = event.target.closest(".reserve-btn");

    if (button && !button.disabled) {
        reserveFood(Number(button.dataset.id));
    }
});

/* Initialize Website */

filterFoods();

updateImpact();
