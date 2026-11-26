
// FoodBridge - Food Listings and Interactive Features

// 1. Pricing Strategy

const discountRate = 0.70;

function calculatePrice(originalPrice) {
    return Math.round(originalPrice * (1 - discountRate));
}


// 2. Food Data

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

];


// 3. Initialize Data

const storageKey = "foodbridge_discount_v4";

let foods = defaultFoods.map(food => ({

    ...food,

    price: calculatePrice(food.originalPrice)

}));

let impact = {
    meals: 0,
    waste: 0,
    money: 0
};


// 4. Load Saved Data

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


// 5. HTML Elements

const foodList = document.getElementById("foodList");

const searchInput = document.getElementById("searchInput");

const regionFilter = document.getElementById("regionFilter");

const categoryFilter = document.getElementById("categoryFilter");

const message = document.getElementById("message");

const contactForm = document.getElementById("contactForm");

const contactStatus = document.getElementById("contactStatus");


// 6. Display Food Cards

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

        const savings = food.originalPrice - food.price;

        const actualDiscount = Math.round(
            (savings / food.originalPrice) * 100
        );

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

                <span style="
                    display: inline-block;
                    background: #304833;
                    color: #ffffff;
                    padding: 5px 10px;
                    margin-left: 5px;
                    font-size: 13px;
                    font-weight: 600;
                ">

                    ${actualDiscount}% OFF

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

                <p style="
                    color: #304833;
                    font-weight: 600;
                    margin-bottom: 15px;
                ">
                    You save NT$${savings}
                </p>

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


// 7. Search and Filter

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


// 8. Reservation Preview

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

    const savings = food.originalPrice - food.price;

    const confirmed = window.confirm(

        food.name + "\n\n" +

        "Store: " + food.store + "\n" +

        "Original Price: NT$" +
        food.originalPrice + "\n" +

        "FoodBridge Price: NT$" +
        food.price + "\n" +

        "You Save: NT$" +
        savings + "\n" +

        "Pickup: " + food.pickup + "\n\n" +

        "Continue with reservation preview?\n" +

        "No actual order or payment will be sent to the store."

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
        " selected successfully! " +
        "Estimated savings: NT$" +
        savings + "."

    );

}


// 9. Environmental Impact

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

        impact.waste +=
            reserved * food.weight;

        impact.money +=
            reserved *
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


// 10. Save Data

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


// 11. Notifications

let messageTimer;

function showMessage(text) {

    clearTimeout(messageTimer);

    message.textContent = text;

    messageTimer = setTimeout(() => {

        message.textContent = "";

    }, 6000);

}


// 12. Store Links

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


// 13. Contact Form

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
        "Message preview completed. No message has been sent.";

});


// 14. Event Listeners

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


// 15. Initialize Website

filterFoods();

updateImpact();
