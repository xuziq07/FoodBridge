
/* ========================================
   FoodBridge 2.0
   Shared Data Management System
======================================== */

const FoodBridgeDB = (() => {

    const DB_KEY = "foodbridge_v2_database";

    // Default food listings
    const defaultFoods = [
        {
            id: 1,
            merchantId: 1,
            name: "Freshly Baked Bread",
            store: "Green Leaf Bakery",
            region: "Taipei",
            category: "Bakery",
            originalPrice: 65,
            discount: 70,
            stock: 5,
            weight: 0.25,
            pickup: "5:00 PM - 7:00 PM",
            image: "green-leaf.jpg",
            active: true
        },
        {
            id: 2,
            merchantId: 2,
            name: "Assorted Pastries",
            store: "Sweetbread Bakery",
            region: "New Taipei",
            category: "Bakery",
            originalPrice: 90,
            discount: 70,
            stock: 4,
            weight: 0.30,
            pickup: "6:00 PM - 8:00 PM",
            image: "sweetbread.jpg",
            active: true
        },
        {
            id: 3,
            merchantId: 3,
            name: "Traditional Bento",
            store: "Sunny Bento Shop",
            region: "Tainan",
            category: "Meals",
            originalPrice: 110,
            discount: 70,
            stock: 5,
            weight: 0.45,
            pickup: "5:00 PM - 7:00 PM",
            image: "sunny-bento.jpg",
            active: true
        }
    ];

    // Default merchant profiles
    const defaultMerchants = [
        {
            id: 1,
            name: "Green Leaf Bakery",
            region: "Taipei",
            email: "",
            address: "",
            phone: "",
            openingHours: ""
        },
        {
            id: 2,
            name: "Sweetbread Bakery",
            region: "New Taipei",
            email: "",
            address: "",
            phone: "",
            openingHours: ""
        },
        {
            id: 3,
            name: "Sunny Bento Shop",
            region: "Tainan",
            email: "",
            address: "",
            phone: "",
            openingHours: ""
        }
    ];

    function createDefaultData() {
        return {
            version: 1,
            foods: defaultFoods.map(food => ({
                ...food,
                price: calculatePrice(
                    food.originalPrice,
                    food.discount
                )
            })),
            merchants: defaultMerchants.map(
                merchant => ({ ...merchant })
            ),
            cart: [],
            favorites: [],
            orders: [],
            currentMerchantId: 1
        };
    }

    // Initialize database
    function init() {
        const storedData = localStorage.getItem(DB_KEY);

        if (!storedData) {
            const data = createDefaultData();
            save(data);
            return data;
        }

        try {
            const data = JSON.parse(storedData);

            if (
                !Array.isArray(data.foods) ||
                !Array.isArray(data.orders) ||
                !Array.isArray(data.cart) ||
                !Array.isArray(data.favorites) ||
                !Array.isArray(data.merchants)
            ) {
                throw new Error("Invalid database");
            }

            return data;

        } catch (error) {
            console.error(error);

            const data = createDefaultData();
            save(data);
            return data;
        }
    }

    function save(data) {
        localStorage.setItem(
            DB_KEY,
            JSON.stringify(data)
        );
    }

    function getData() {
        return init();
    }

    // Price calculation
    function calculatePrice(originalPrice, discount = 70) {
        const price = Number(originalPrice);
        const rate = Number(discount);

        if (
            !Number.isFinite(price) ||
            price < 0 ||
            !Number.isFinite(rate) ||
            rate < 0 ||
            rate > 100
        ) {
            throw new Error("Invalid price or discount.");
        }

        return Math.round(price * (1 - rate / 100));
    }

    // Food listings
    function getFoods() {
        return getData().foods;
    }

    function getAvailableFoods() {
        return getFoods().filter(
            food => food.active && food.stock > 0
        );
    }

    function getFood(id) {
        return getFoods().find(
            food => food.id === Number(id)
        );
    }

    function getMerchantFoods(merchantId) {
        return getFoods().filter(
            food => food.merchantId === Number(merchantId)
        );
    }

    function validateFood(food) {
        if (!String(food.name || "").trim()) {
            throw new Error("Food name is required.");
        }

        if (
            !Number.isFinite(Number(food.originalPrice)) ||
            Number(food.originalPrice) <= 0
        ) {
            throw new Error("Enter a valid original price.");
        }

        if (
            !Number.isInteger(Number(food.stock)) ||
            Number(food.stock) < 0
        ) {
            throw new Error("Enter a valid stock quantity.");
        }

        if (
            !Number.isFinite(Number(food.weight)) ||
            Number(food.weight) < 0
        ) {
            throw new Error("Enter a valid food weight.");
        }
    }

    function addFood(food) {
        const data = getData();

        const merchant = data.merchants.find(
            item => item.id === Number(
                food.merchantId || data.currentMerchantId
            )
        );

        if (!merchant) {
            throw new Error("Merchant not found.");
        }

        validateFood(food);

        const discount = Number(food.discount ?? 70);

        const newFood = {
            id: Math.max(
                Date.now(),
                ...data.foods.map(item => item.id + 1)
            ),
            merchantId: merchant.id,
            name: String(food.name).trim(),
            store: merchant.name,
            region: merchant.region,
            category: food.category || "Other",
            originalPrice: Number(food.originalPrice),
            discount: discount,
            price: calculatePrice(
                food.originalPrice,
                discount
            ),
            stock: Number(food.stock),
            weight: Number(food.weight),
            pickup: food.pickup || "Contact the store",
            image: food.image || "bakery.jpg",
            active: true
        };

        data.foods.push(newFood);
        save(data);

        return newFood;
    }

    function updateFood(id, updates) {
        const data = getData();

        const index = data.foods.findIndex(
            food => food.id === Number(id)
        );

        if (index === -1) {
            return false;
        }

        const oldFood = data.foods[index];

        const updatedFood = {
            ...oldFood,
            ...updates,
            id: oldFood.id,
            merchantId: oldFood.merchantId
        };

        validateFood(updatedFood);

        updatedFood.originalPrice =
            Number(updatedFood.originalPrice);

        updatedFood.discount =
            Number(updatedFood.discount);

        updatedFood.stock =
            Number(updatedFood.stock);

        updatedFood.weight =
            Number(updatedFood.weight);

        updatedFood.price = calculatePrice(
            updatedFood.originalPrice,
            updatedFood.discount
        );

        data.foods[index] = updatedFood;

        save(data);

        return true;
    }

    function deleteFood(id) {
        const data = getData();
        id = Number(id);

        const food = data.foods.find(
            item => item.id === id
        );

        if (!food) {
            return false;
        }

        // Keep food records for order history
        food.active = false;

        data.cart = data.cart.filter(
            item => item.foodId !== id
        );

        data.favorites = data.favorites.filter(
            foodId => foodId !== id
        );

        save(data);

        return true;
    }

    // Favorites
    function getFavorites() {
        return getData().favorites;
    }

    function toggleFavorite(id) {
        const data = getData();
        id = Number(id);

        if (!data.foods.some(food => food.id === id)) {
            return false;
        }

        if (data.favorites.includes(id)) {
            data.favorites = data.favorites.filter(
                foodId => foodId !== id
            );
        } else {
            data.favorites.push(id);
        }

        save(data);

        return data.favorites.includes(id);
    }

    function isFavorite(id) {
        return getFavorites().includes(Number(id));
    }

    // Shopping cart
    function getCart() {
        const data = getData();

        return data.cart.map(item => ({
            ...item,
            food: data.foods.find(
                food => food.id === item.foodId
            )
        })).filter(item => item.food);
    }

    function addToCart(id, quantity = 1) {
        const data = getData();

        id = Number(id);
        quantity = Number(quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
            return {
                success: false,
                message: "Invalid quantity."
            };
        }

        const food = data.foods.find(
            item => item.id === id
        );

        if (!food || !food.active || food.stock <= 0) {
            return {
                success: false,
                message: "This item is unavailable."
            };
        }

        const existing = data.cart.find(
            item => item.foodId === id
        );

        const totalQuantity =
            (existing ? existing.quantity : 0) + quantity;

        if (totalQuantity > food.stock) {
            return {
                success: false,
                message: "Not enough stock available."
            };
        }

        if (existing) {
            existing.quantity = totalQuantity;
        } else {
            data.cart.push({
                foodId: id,
                quantity: quantity
            });
        }

        save(data);

        return {
            success: true,
            message: "Added to your cart!"
        };
    }

    function updateCartQuantity(id, quantity) {
        const data = getData();

        id = Number(id);
        quantity = Number(quantity);

        const item = data.cart.find(
            entry => entry.foodId === id
        );

        const food = data.foods.find(
            entry => entry.id === id
        );

        if (!item || !food || !Number.isInteger(quantity)) {
            return false;
        }

        if (quantity <= 0) {
            removeFromCart(id);
            return true;
        }

        if (!food.active || quantity > food.stock) {
            return false;
        }

        item.quantity = quantity;

        save(data);

        return true;
    }

    function removeFromCart(id) {
        const data = getData();

        data.cart = data.cart.filter(
            item => item.foodId !== Number(id)
        );

        save(data);
    }

    function clearCart() {
        const data = getData();

        data.cart = [];

        save(data);
    }

    function getCartTotals() {
        const cart = getCart();

        let total = 0;
        let originalTotal = 0;
        let quantity = 0;
        let waste = 0;

        cart.forEach(item => {
            total += item.food.price * item.quantity;

            originalTotal +=
                item.food.originalPrice * item.quantity;

            quantity += item.quantity;

            waste += item.food.weight * item.quantity;
        });

        return {
            total,
            originalTotal,
            savings: originalTotal - total,
            quantity,
            waste
        };
    }

    // Order management
    function createOrder(customerName = "Guest Customer") {
        const data = getData();

        if (data.cart.length === 0) {
            return {
                success: false,
                message: "Your cart is empty."
            };
        }

        const orderItems = [];

        for (const item of data.cart) {
            const food = data.foods.find(
                entry => entry.id === item.foodId
            );

            if (
                !food ||
                !food.active ||
                food.stock < item.quantity
            ) {
                return {
                    success: false,
                    message: "Some items are unavailable."
                };
            }

            orderItems.push({
                foodId: food.id,
                merchantId: food.merchantId,
                name: food.name,
                store: food.store,
                image: food.image,
                price: food.price,
                originalPrice: food.originalPrice,
                quantity: item.quantity,
                weight: food.weight,
                pickup: food.pickup,
                status: "Pending"
            });
        }

        const order = {
            id: "FB-" + Date.now(),
            customerName: String(customerName).trim()
                || "Guest Customer",
            date: new Date().toISOString(),
            items: orderItems,
            total: orderItems.reduce(
                (sum, item) =>
                    sum + item.price * item.quantity,
                0
            ),
            savings: orderItems.reduce(
                (sum, item) =>
                    sum +
                    (item.originalPrice - item.price)
                    * item.quantity,
                0
            )
        };

        // Deduct inventory
        orderItems.forEach(item => {
            const food = data.foods.find(
                entry => entry.id === item.foodId
            );

            food.stock -= item.quantity;
        });

        data.orders.unshift(order);
        data.cart = [];

        save(data);

        return {
            success: true,
            order: order
        };
    }

    function getOrders() {
        return getData().orders;
    }

    function getMerchantOrders(merchantId) {
        merchantId = Number(merchantId);

        return getOrders()
            .map(order => ({
                ...order,
                items: order.items.filter(
                    item => item.merchantId === merchantId
                )
            }))
            .filter(order => order.items.length > 0)
            .map(order => ({
                ...order,
                total: order.items.reduce(
                    (sum, item) =>
                        sum + item.price * item.quantity,
                    0
                ),
                savings: order.items.reduce(
                    (sum, item) =>
                        sum +
                        (item.originalPrice - item.price)
                        * item.quantity,
                    0
                )
            }));
    }

    function updateOrderStatus(
        orderId,
        merchantId,
        status
    ) {
        const data = getData();

        const order = data.orders.find(
            item => item.id === orderId
        );

        if (!order) {
            return false;
        }

        const transitions = {
            "Pending": ["Confirmed", "Cancelled"],
            "Confirmed": ["Ready for Pickup", "Cancelled"],
            "Ready for Pickup": ["Completed", "Cancelled"],
            "Completed": [],
            "Cancelled": []
        };

        const items = order.items.filter(
            item => item.merchantId === Number(merchantId)
        );

        if (
            items.length === 0 ||
            items.some(item =>
                !transitions[item.status]?.includes(status)
            )
        ) {
            return false;
        }

        items.forEach(item => {
            if (status === "Cancelled") {
                const food = data.foods.find(
                    entry => entry.id === item.foodId
                );

                if (food) {
                    food.stock += item.quantity;
                }
            }

            item.status = status;
        });

        save(data);

        return true;
    }

    // Customer sustainability impact
    function getCustomerImpact() {
        const orders = getOrders();

        let meals = 0;
        let savings = 0;
        let waste = 0;
        let spending = 0;

        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.status !== "Completed") {
                    return;
                }

                meals += item.quantity;

                savings +=
                    (item.originalPrice - item.price)
                    * item.quantity;

                waste += item.weight * item.quantity;

                spending += item.price * item.quantity;
            });
        });

        return {
            meals,
            savings,
            waste,
            spending
        };
    }

    // Merchant statistics
    function getMerchantStats(merchantId) {
        const foods = getMerchantFoods(merchantId);
        const orders = getMerchantOrders(merchantId);

        let revenue = 0;
        let mealsSold = 0;
        let waste = 0;
        let pendingOrders = 0;

        orders.forEach(order => {
            if (
                order.items.some(
                    item => item.status === "Pending"
                )
            ) {
                pendingOrders++;
            }

            order.items.forEach(item => {
                if (item.status !== "Completed") {
                    return;
                }

                revenue += item.price * item.quantity;

                mealsSold += item.quantity;

                waste += item.weight * item.quantity;
            });
        });

        return {
            revenue,
            mealsSold,
            waste,
            pendingOrders,
            totalOrders: orders.length,
            availableStock: foods
                .filter(food => food.active)
                .reduce(
                    (sum, food) => sum + food.stock,
                    0
                )
        };
    }

    // Merchant profiles
    function getMerchants() {
        return getData().merchants;
    }

    function getCurrentMerchant() {
        const data = getData();

        return data.merchants.find(
            merchant =>
                merchant.id === data.currentMerchantId
        );
    }

    function setCurrentMerchant(id) {
        const data = getData();

        id = Number(id);

        if (!data.merchants.some(item => item.id === id)) {
            return false;
        }

        data.currentMerchantId = id;

        save(data);

        return true;
    }

    function updateMerchant(id, updates) {
        const data = getData();

        const merchant = data.merchants.find(
            item => item.id === Number(id)
        );

        if (!merchant) {
            return false;
        }

        const allowedFields = [
            "name",
            "region",
            "email",
            "address",
            "phone",
            "openingHours"
        ];

        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                merchant[field] = String(updates[field]);
            }
        });

        data.foods.forEach(food => {
            if (food.merchantId === merchant.id) {
                food.store = merchant.name;
                food.region = merchant.region;
            }
        });

        save(data);

        return true;
    }

    // Reset demonstration data
    function resetDatabase() {
        const data = createDefaultData();

        save(data);

        return data;
    }

    // Initialize on page load
    init();

    return {
        getData,
        calculatePrice,

        getFoods,
        getAvailableFoods,
        getFood,
        getMerchantFoods,
        addFood,
        updateFood,
        deleteFood,

        getFavorites,
        toggleFavorite,
        isFavorite,

        getCart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getCartTotals,

        createOrder,
        getOrders,
        getMerchantOrders,
        updateOrderStatus,

        getCustomerImpact,
        getMerchantStats,

        getMerchants,
        getCurrentMerchant,
        setCurrentMerchant,
        updateMerchant,

        resetDatabase
    };

})();

window.FoodBridgeDB = FoodBridgeDB;

console.log("FoodBridge 2.0 Database Ready!");
