
// FoodBridge - Food Listings and Interactive Features

// 1. Food Data

const defaultFoods = [
    {
        id: 1,
        name: "Freshly Baked Bread",
        store: "Green Leaf Bakery",
        region: "Taipei",
        category: "Bakery",
        price: 35,
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
        price: 50,
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
        price: 60,
        originalPrice: 110,
        stock: 5,
        weight: 0.45,
        pickup: "5:00 PM - 7:00 PM",
        image: "sunny-bento.jpg"
    }
];


// 2. Initialize Data

const storageKey = "foodbridge_midterm_v3";

let foods = defaultFoods.map(food => ({ ...food }));

let impact = {
    meals: 0,
    waste: 0,
    money: 0
};


// 3. Load Saved Reservations

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


// 4. HTML Elements

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


// 5. Display Food Cards

function displayFoods(items) {

    foodList.innerHTML = "";

    if (items.length === 0) {

        foodList.innerHTML = `
            <div class="empty-state">

                <h3>No matching meals</h3>

                <p>
                    Try another search or change your filters.
                </p>

            </div>
        `;

        return;

    }

    items.forEach(food => {

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


// 6. Search and Filter

function filterFoods() {

    const keyword =
        searchInput.value.toLowerCase().trim();

    const region =
        regionFilter.value;

    const category =
        categoryFilter.value;

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


// 7. Reservation

function reserveFood(id) {

    const food = foods.find(
        item => item.id === id
    );

    if (!food || food.stock <= 0) {

        showMessage(
            "This item is no longer available."
        );

        return;

    }

    const confirmed = window.confirm(

        food.name + "\n\n" +

        "Store: " + food.store + "\n" +

        "Price: NT$" + food.price + "\n" +

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


// 8. Environmental Impact

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

        const reserved =
            original.stock - food.stock;

        impact.meals += reserved;

        impact.waste += reserved * food.weight;

        impact.money += reserved *
            (food.originalPrice - food.price);

    });

    document.getElementById("savedMeals")
        .textContent = impact.meals;

    document.getElementById("savedWaste")
        .textContent = impact.waste.toFixed(2);

    document.getElementById("savedMoney")
        .textContent =
            impact.money.toLocaleString("en-US");

}


// 9. Save Data

function saveData() {

    const stock = {};

    foods.forEach(food => {

        stock[food.id] = food.stock;

    });

    try {

        localStorage.setItem(

            storageKey,

            JSON.stringify({
                stock: stock
            })

        );

    } catch (error) {

        console.warn("Unable to save data.");

    }

}


// 10. Notifications

let messageTimer;

function showMessage(text) {

    clearTimeout(messageTimer);

    message.textContent = text;

    messageTimer = setTimeout(() => {

        message.textContent = "";

    }, 6000);

}


// 11. Store Links

document.querySelectorAll("[data-store]")
    .forEach(link => {

        link.addEventListener("click", () => {

            searchInput.value =
                link.dataset.store;

            regionFilter.value = "all";

            categoryFilter.value = "all";

            filterFoods();

        });

    });


// 12. Contact Form

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


// 13. Event Listeners

searchInput.addEventListener(
    "input",
    filterFoods
);

regionFilter.addEventListener(
    "change",
    filterFoods
);

categoryFilter.addEventListener(
    "change",
    filterFoods
);

foodList.addEventListener("click", event => {

    const button =
        event.target.closest(".reserve-btn");

    if (button && !button.disabled) {

        reserveFood(
            Number(button.dataset.id)
        );

    }

});


// 14. Initialize Website

filterFoods();

updateImpact();
