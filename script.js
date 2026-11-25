
/* ========================================
   FoodBridge - Interactive Features
   ======================================== */

// 1. Food Database

const defaultFoods = [
    {
        id: 1,
        name: "Chicken Bento",
        store: "Green Kitchen",
        region: "Taipei",
        category: "Meals",
        price: 60,
        originalPrice: 110,
        stock: 5,
        weight: 0.45,
        pickup: "5:00 PM - 7:00 PM",
        image: "🍱"
    },
    {
        id: 2,
        name: "Sesame Cold Noodles",
        store: "Happy Noodle House",
        region: "New Taipei",
        category: "Noodles",
        price: 35,
        originalPrice: 65,
        stock: 4,
        weight: 0.35,
        pickup: "4:00 PM - 6:00 PM",
        image: "🍜"
    },
    {
        id: 3,
        name: "Artisan Bread",
        store: "Sunrise Bakery",
        region: "Taipei",
        category: "Bakery",
        price: 25,
        originalPrice: 50,
        stock: 6,
        weight: 0.25,
        pickup: "6:00 PM - 8:00 PM",
        image: "🥐"
    },
    {
        id: 4,
        name: "Vegetable Salad Bowl",
        store: "Fresh & Green",
        region: "Taipei",
        category: "Light Meals",
        price: 50,
        originalPrice: 95,
        stock: 3,
        weight: 0.4,
        pickup: "5:00 PM - 7:00 PM",
        image: "🥗"
    },
    {
        id: 5,
        name: "Teriyaki Rice Bowl",
        store: "Daily Rice Kitchen",
        region: "New Taipei",
        category: "Meals",
        price: 70,
        originalPrice: 130,
        stock: 4,
        weight: 0.5,
        pickup: "6:00 PM - 8:00 PM",
        image: "🍚"
    },
    {
        id: 6,
        name: "Fresh Sandwich",
        store: "Morning Cafe",
        region: "New Taipei",
        category: "Light Meals",
        price: 40,
        originalPrice: 80,
        stock: 5,
        weight: 0.3,
        pickup: "3:00 PM - 5:00 PM",
        image: "🥪"
    }
];

// 2. Load Saved Data

let foods = JSON.parse(
    JSON.stringify(defaultFoods)
);

let impact = {
    meals: 0,
    waste: 0,
    money: 0
};

try {
    const savedData = localStorage.getItem(
        "foodbridgeData"
    );

    if (savedData) {
        const data = JSON.parse(savedData);

        if (Array.isArray(data.foods) && data.impact) {
            foods = data.foods;
            impact = data.impact;
        }
    }
} catch (error) {
    console.warn("Saved data could not be loaded.");
}

// 3. Select HTML Elements

const foodList = document.getElementById("foodList");

const searchInput = document.getElementById(
    "searchInput"
);

const regionFilter = document.getElementById(
    "regionFilter"
);

const categoryFilter = document.getElementById(
    "categoryFilter"
);

const message = document.getElementById("message");

const contactForm = document.getElementById(
    "contactForm"
);

// 4. Display Food Cards

function displayFoods(foodArray) {

    foodList.innerHTML = "";

    if (foodArray.length === 0) {

        foodList.innerHTML = `
            <div class="empty-state">
                <h3>No food found</h3>
                <p>
                    Try another keyword or change
                    your filters.
                </p>
            </div>
        `;

        return;
    }

    foodArray.forEach(food => {

        const discount = Math.round(
            (1 - food.price / food.originalPrice) * 100
        );

        const card = document.createElement("article");

        card.className = "food-card";

        card.innerHTML = `

            <div class="food-image">
                ${food.image}
            </div>

            <div class="food-content">

                <span class="stock">
                    ${
                        food.stock > 0
                        ? food.stock + " left"
                        : "Sold Out"
                    }
                </span>

                <h3>${food.name}</h3>

                <p>🏪 ${food.store}</p>

                <p>📍 ${food.region}</p>

                <p>🕒 Pickup: ${food.pickup}</p>

                <p>Category: ${food.category}</p>

                <div>

                    <span class="price">
                        NT$${food.price}
                    </span>

                    <span class="original-price">
                        NT$${food.originalPrice}
                    </span>

                </div>

                <p>${discount}% OFF</p>

                <button
                    class="reserve-btn"
                    data-id="${food.id}"
                    ${food.stock === 0 ? "disabled" : ""}
                >
                    ${
                        food.stock > 0
                        ? "Reserve Now"
                        : "Sold Out"
                    }
                </button>

            </div>
        `;

        foodList.appendChild(card);

    });

}

// 5. Search and Filter Food

function filterFoods() {

    const keyword = searchInput.value
        .toLowerCase()
        .trim();

    const selectedRegion = regionFilter.value;

    const selectedCategory = categoryFilter.value;

    const filteredFoods = foods.filter(food => {

        const matchesKeyword =
            food.name.toLowerCase().includes(keyword) ||
            food.store.toLowerCase().includes(keyword);

        const matchesRegion =
            selectedRegion === "all" ||
            food.region === selectedRegion;

        const matchesCategory =
            selectedCategory === "all" ||
            food.category === selectedCategory;

        return (
            matchesKeyword &&
            matchesRegion &&
            matchesCategory
        );

    });

    displayFoods(filteredFoods);

}

// 6. Reservation System

function reserveFood(id) {

    const food = foods.find(
        item => item.id === id
    );

    if (!food || food.stock <= 0) {
        showMessage("This item is no longer available.");
        return;
    }

    const confirmed = confirm(
        `Reserve one ${food.name} for NT$${food.price}?`
    );

    if (!confirmed) {
        return;
    }

    // Reduce available stock

    food.stock -= 1;

    // Update environmental impact

    impact.meals += 1;

    impact.waste += food.weight;

    impact.money +=
        food.originalPrice - food.price;

    // Save and refresh data

    saveData();

    filterFoods();

    updateImpact();

    showMessage(
        `Demo reservation successful! You reserved ${food.name}.`
    );

}

// 7. Environmental Impact Calculator

function updateImpact() {

    document.getElementById(
        "savedMeals"
    ).textContent = impact.meals;

    document.getElementById(
        "savedWaste"
    ).textContent = impact.waste.toFixed(2);

    document.getElementById(
        "savedMoney"
    ).textContent = impact.money.toLocaleString("en-US");

}

// 8. Save Data to Local Storage

function saveData() {

    try {

        localStorage.setItem(
            "foodbridgeData",
            JSON.stringify({
                foods: foods,
                impact: impact
            })
        );

    } catch (error) {

        console.warn("Unable to save data.");

    }

}

// 9. Display Notification

let messageTimer;

function showMessage(text) {

    clearTimeout(messageTimer);

    message.textContent = text;

    messageTimer = setTimeout(() => {
        message.textContent = "";
    }, 5000);

}

// 10. Contact Form

contactForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const name = document.getElementById(
            "name"
        ).value.trim();

        const email = document.getElementById(
            "email"
        ).value.trim();

        const feedback = document.getElementById(
            "feedback"
        ).value.trim();

        if (!name || !email || !feedback) {

            alert("Please complete all fields.");

            return;
        }

        alert(
            `Thank you, ${name}! ` +
            "Your demo form was completed successfully. " +
            "No message has been sent to a server."
        );

        contactForm.reset();

    }
);

// 11. Event Listeners

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

foodList.addEventListener("click", function(event) {

    const button = event.target.closest(".reserve-btn");

    if (button && !button.disabled) {
        reserveFood(Number(button.dataset.id));
    }

});

// 12. Initialize Website

filterFoods();

updateImpact();
