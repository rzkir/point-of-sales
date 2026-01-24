"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { API_CONFIG } from '@/lib/config'
import { useAuth } from '@/context/AuthContext'
import {
    IconCoffee,
    IconToolsKitchen,
    IconSoup,
    IconIceCream,
    IconFish,
    IconCheese,
    IconGlassFull,
    IconCash,
    IconMinus,
    IconPlus,
    IconLoader,
} from '@tabler/icons-react'

// Dummy data untuk produk
const products = [
    // Breakfast
    {
        id: 1,
        name: 'Pancakes with Maple Syrup',
        description: 'Fluffy pancakes served with sweet maple syrup',
        price: 25.5,
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop',
        category: 'Breakfast',
    },
    {
        id: 2,
        name: 'Scrambled Eggs & Toast',
        description: 'Fresh scrambled eggs with buttered toast',
        price: 18.0,
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&h=200&fit=crop',
        category: 'Breakfast',
    },
    {
        id: 3,
        name: 'French Toast',
        description: 'Classic French toast with berries',
        price: 22.5,
        image: 'https://images.unsplash.com/photo-1484723091739-30a097b8f369?w=200&h=200&fit=crop',
        category: 'Breakfast',
    },
    {
        id: 4,
        name: 'Avocado Toast',
        description: 'Smashed avocado on sourdough bread',
        price: 20.0,
        image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=200&h=200&fit=crop',
        category: 'Breakfast',
    },
    {
        id: 5,
        name: 'Breakfast Burrito',
        description: 'Eggs, cheese, and bacon wrapped in tortilla',
        price: 28.0,
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&h=200&fit=crop',
        category: 'Breakfast',
    },
    {
        id: 6,
        name: 'Waffles with Berries',
        description: 'Crispy waffles topped with fresh berries',
        price: 24.5,
        image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=200&h=200&fit=crop',
        category: 'Breakfast',
    },
    // Lunch
    {
        id: 7,
        name: 'Pasta Bolognese',
        description: 'Delicious beef lasagna with double chill Delicious beef',
        price: 50.5,
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop',
        category: 'Lunch',
    },
    {
        id: 8,
        name: 'Spicy Fried Chicken',
        description: 'Crispy fried chicken with special spicy sauce',
        price: 45.7,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop',
        category: 'Lunch',
    },
    {
        id: 9,
        name: 'Grilled Steak',
        description: 'Premium beef steak grilled to perfection',
        price: 80.0,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop',
        category: 'Lunch',
    },
    {
        id: 10,
        name: 'Fish And Chips',
        description: 'Classic fish and chips with tartar sauce',
        price: 90.4,
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200&h=200&fit=crop',
        category: 'Lunch',
    },
    {
        id: 11,
        name: 'Beef Bourguignon',
        description: 'French classic beef stew with red wine',
        price: 75.5,
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop',
        category: 'Lunch',
    },
    {
        id: 12,
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with bacon and parmesan',
        price: 35.3,
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop',
        category: 'Lunch',
    },
    // Dinner
    {
        id: 13,
        name: 'Roasted Chicken',
        description: 'Whole roasted chicken with herbs',
        price: 65.0,
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&h=200&fit=crop',
        category: 'Dinner',
    },
    {
        id: 14,
        name: 'Beef Tenderloin',
        description: 'Premium beef tenderloin with vegetables',
        price: 95.0,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop',
        category: 'Dinner',
    },
    {
        id: 15,
        name: 'Salmon Teriyaki',
        description: 'Grilled salmon with teriyaki glaze',
        price: 70.0,
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop',
        category: 'Dinner',
    },
    {
        id: 16,
        name: 'Lamb Chops',
        description: 'Herb-crusted lamb chops with mint sauce',
        price: 88.0,
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop',
        category: 'Dinner',
    },
    {
        id: 17,
        name: 'Pork Ribs',
        description: 'BBQ pork ribs with coleslaw',
        price: 55.0,
        image: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=200&h=200&fit=crop',
        category: 'Dinner',
    },
    {
        id: 18,
        name: 'Seafood Paella',
        description: 'Spanish rice dish with mixed seafood',
        price: 75.0,
        image: 'https://images.unsplash.com/photo-1559314809-0b1e0c2c0a0e?w=200&h=200&fit=crop',
        category: 'Dinner',
    },
    // Soup
    {
        id: 19,
        name: 'Tomato Soup',
        description: 'Creamy tomato soup with basil',
        price: 15.5,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
        category: 'Soup',
    },
    {
        id: 20,
        name: 'Chicken Noodle Soup',
        description: 'Classic chicken noodle soup',
        price: 18.0,
        image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=200&h=200&fit=crop',
        category: 'Soup',
    },
    {
        id: 21,
        name: 'Mushroom Soup',
        description: 'Creamy mushroom soup',
        price: 16.5,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
        category: 'Soup',
    },
    {
        id: 22,
        name: 'Minestrone',
        description: 'Italian vegetable soup',
        price: 17.0,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop',
        category: 'Soup',
    },
    {
        id: 23,
        name: 'French Onion Soup',
        description: 'Caramelized onion soup with cheese',
        price: 19.5,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
        category: 'Soup',
    },
    {
        id: 24,
        name: 'Clam Chowder',
        description: 'New England style clam chowder',
        price: 22.0,
        image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=200&h=200&fit=crop',
        category: 'Soup',
    },
    // Desserts
    {
        id: 25,
        name: 'Chocolate Cake',
        description: 'Rich chocolate layer cake',
        price: 28.0,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop',
        category: 'Desserts',
    },
    {
        id: 26,
        name: 'Cheesecake',
        description: 'New York style cheesecake',
        price: 30.0,
        image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=200&h=200&fit=crop',
        category: 'Desserts',
    },
    {
        id: 27,
        name: 'Tiramisu',
        description: 'Classic Italian tiramisu',
        price: 32.0,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop',
        category: 'Desserts',
    },
    {
        id: 28,
        name: 'Ice Cream Sundae',
        description: 'Vanilla ice cream with toppings',
        price: 18.5,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop',
        category: 'Desserts',
    },
    {
        id: 29,
        name: 'Apple Pie',
        description: 'Homemade apple pie with cinnamon',
        price: 24.0,
        image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=200&h=200&fit=crop',
        category: 'Desserts',
    },
    {
        id: 30,
        name: 'Crème Brûlée',
        description: 'Classic French custard dessert',
        price: 26.0,
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop',
        category: 'Desserts',
    },
    // Side Dish
    {
        id: 31,
        name: 'French Fries',
        description: 'Crispy golden french fries',
        price: 12.0,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop',
        category: 'Side Dish',
    },
    {
        id: 32,
        name: 'Mashed Potatoes',
        description: 'Creamy mashed potatoes',
        price: 10.5,
        image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=200&h=200&fit=crop',
        category: 'Side Dish',
    },
    {
        id: 33,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing',
        price: 14.0,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200&h=200&fit=crop',
        category: 'Side Dish',
    },
    {
        id: 34,
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter',
        price: 8.5,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop',
        category: 'Side Dish',
    },
    {
        id: 35,
        name: 'Onion Rings',
        description: 'Crispy battered onion rings',
        price: 11.0,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop',
        category: 'Side Dish',
    },
    {
        id: 36,
        name: 'Coleslaw',
        description: 'Fresh cabbage coleslaw',
        price: 9.0,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200&h=200&fit=crop',
        category: 'Side Dish',
    },
    // Appetizer
    {
        id: 37,
        name: 'Bruschetta',
        description: 'Toasted bread with tomato and basil',
        price: 16.0,
        image: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=200&h=200&fit=crop',
        category: 'Appetizer',
    },
    {
        id: 38,
        name: 'Chicken Wings',
        description: 'Spicy buffalo chicken wings',
        price: 22.0,
        image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200&h=200&fit=crop',
        category: 'Appetizer',
    },
    {
        id: 39,
        name: 'Spring Rolls',
        description: 'Crispy vegetable spring rolls',
        price: 18.5,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop',
        category: 'Appetizer',
    },
    {
        id: 40,
        name: 'Mozzarella Sticks',
        description: 'Fried mozzarella with marinara sauce',
        price: 19.0,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop',
        category: 'Appetizer',
    },
    {
        id: 41,
        name: 'Shrimp Cocktail',
        description: 'Chilled shrimp with cocktail sauce',
        price: 28.0,
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200&h=200&fit=crop',
        category: 'Appetizer',
    },
    {
        id: 42,
        name: 'Nachos',
        description: 'Tortilla chips with cheese and jalapeños',
        price: 20.0,
        image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=200&h=200&fit=crop',
        category: 'Appetizer',
    },
    // Beverages
    {
        id: 43,
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 8.0,
        image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200&h=200&fit=crop',
        category: 'Beverages',
    },
    {
        id: 44,
        name: 'Iced Coffee',
        description: 'Cold brew iced coffee',
        price: 12.0,
        image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=200&h=200&fit=crop',
        category: 'Beverages',
    },
    {
        id: 45,
        name: 'Lemonade',
        description: 'Fresh homemade lemonade',
        price: 7.5,
        image: 'https://images.unsplash.com/photo-1523677011783-c91d1bbe2fdc?w=200&h=200&fit=crop',
        category: 'Beverages',
    },
    {
        id: 46,
        name: 'Smoothie',
        description: 'Mixed fruit smoothie',
        price: 14.0,
        image: 'https://images.unsplash.com/photo-1505252585461-04c69a4a63e0?w=200&h=200&fit=crop',
        category: 'Beverages',
    },
    {
        id: 47,
        name: 'Coca Cola',
        description: 'Classic cola drink',
        price: 6.0,
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop',
        category: 'Beverages',
    },
    {
        id: 48,
        name: 'Iced Tea',
        description: 'Refreshing iced tea',
        price: 7.0,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c197cbc?w=200&h=200&fit=crop',
        category: 'Beverages',
    },
]

// Dummy data untuk kategori dengan menuCount yang dinamis
const getCategoryCount = (categoryName: string) => {
    return products.filter((p) => p.category === categoryName).length
}

const categories = [
    { id: 1, name: 'Breakfast', icon: IconCoffee, menuCount: getCategoryCount('Breakfast') },
    { id: 2, name: 'Lunch', icon: IconToolsKitchen, menuCount: getCategoryCount('Lunch') },
    { id: 3, name: 'Dinner', icon: IconSoup, menuCount: getCategoryCount('Dinner') },
    { id: 4, name: 'Soup', icon: IconSoup, menuCount: getCategoryCount('Soup') },
    { id: 5, name: 'Desserts', icon: IconIceCream, menuCount: getCategoryCount('Desserts') },
    { id: 6, name: 'Side Dish', icon: IconFish, menuCount: getCategoryCount('Side Dish') },
    { id: 7, name: 'Appetizer', icon: IconCheese, menuCount: getCategoryCount('Appetizer') },
    { id: 8, name: 'Beverages', icon: IconGlassFull, menuCount: getCategoryCount('Beverages') },
]


interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
    image: string
    note?: string
}

export default function ProductsKaryawan() {
    const { user } = useAuth()
    const [selectedCategory, setSelectedCategory] = useState('Lunch')
    const [quantities, setQuantities] = useState<Record<number, number>>({})
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        customer_name: '',
        discount: 0,
        is_credit: false,
        paid_amount: 0,
    })

    // Get branch name from logged in user
    const branchName = user?.branchName || ''

    const filteredProducts = products.filter((p) => p.category === selectedCategory)

    const handleQuantityChange = (productId: number, change: number) => {
        setQuantities((prev) => {
            const newQty = Math.max(0, (prev[productId] || 0) + change)
            const newQuantities = { ...prev, [productId]: newQty }

            // Update cart items
            if (newQty === 0) {
                setCartItems((prev) => prev.filter((item) => item.id !== productId))
            } else {
                const product = products.find((p) => p.id === productId)
                if (product) {
                    setCartItems((prev) => {
                        const existingItem = prev.find((item) => item.id === productId)
                        if (existingItem) {
                            return prev.map((item) =>
                                item.id === productId
                                    ? { ...item, quantity: newQty }
                                    : item
                            )
                        } else {
                            return [
                                ...prev,
                                {
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    quantity: newQty,
                                    image: product.image,
                                    note: 'Dont Add Vegetables',
                                },
                            ]
                        }
                    })
                }
            }

            return newQuantities
        })
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discountAmount = Number(formData.discount) || 0
    const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount)
    const tax = subtotalAfterDiscount * 0.04 // 4% tax
    const total = subtotalAfterDiscount + tax

    // Calculate paid_amount: if not credit, paid = total; if credit, use form value
    const paidAmount = formData.is_credit
        ? Math.min(Number(formData.paid_amount) || 0, total)
        : total
    const dueAmount = Math.max(0, total - paidAmount)

    const handlePlaceOrder = () => {
        if (cartItems.length === 0) {
            toast.error('Cart is empty')
            return
        }
        // Reset form data dan set paid_amount = total (untuk non-credit)
        const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const currentDiscount = Number(formData.discount) || 0
        const currentSubtotalAfterDiscount = Math.max(0, currentSubtotal - currentDiscount)
        const currentTax = currentSubtotalAfterDiscount * 0.04
        const currentTotal = currentSubtotalAfterDiscount + currentTax

        setFormData((prev) => ({
            ...prev,
            is_credit: false,
            paid_amount: currentTotal,
        }))
        setIsDialogOpen(true)
    }

    const handleSubmitTransaction = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validasi: jika kasbon, customer_name wajib
        if (formData.is_credit && !formData.customer_name?.trim()) {
            toast.error('Customer name is required for credit transactions')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.transactions.base, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
                body: JSON.stringify({
                    customer_name: formData.customer_name || '',
                    subtotal: subtotalAfterDiscount,
                    tax: tax,
                    total: total,
                    discount: discountAmount,
                    paid_amount: paidAmount,
                    is_credit: formData.is_credit,
                    branch_name: branchName,
                    payment_method: 'cash',
                    status: 'pending',
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create transaction')
            }

            toast.success('Order placed successfully!', {
                description: `Transaction number: ${data.data?.transaction_number || 'N/A'}`,
            })

            // Reset cart and form
            setCartItems([])
            setQuantities({})
            setFormData({
                customer_name: '',
                discount: 0,
                is_credit: false,
                paid_amount: 0,
            })
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Place order error:', error)
            toast.error('Failed to place order', {
                description: error instanceof Error ? error.message : 'Please try again',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="flex h-full gap-6 p-6 bg-muted/30">
            {/* Main Content Area */}
            <div className="flex-1">
                {/* Categories */}
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    {categories.map((category) => {
                        const Icon = category.icon
                        const isSelected = category.name === selectedCategory
                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-lg border min-w-[120px] transition-all ${isSelected
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-card border-border hover:bg-accent hover:text-accent-foreground'
                                    }`}
                            >
                                <Icon className="size-6" />
                                <span className="font-medium text-sm">{category.name}</span>
                                <span className="text-xs opacity-75">
                                    {category.menuCount} Menu In Stock
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Category Title */}
                <h2 className="text-2xl font-bold mb-6">{selectedCategory} Menu</h2>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground text-lg">
                            No products available in this category
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {filteredProducts.map((product) => {
                            const quantity = quantities[product.id] || 0
                            return (
                                <Card key={product.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={80}
                                                height={80}
                                                className="w-20 h-20 rounded-full object-cover shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg mb-1">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                    {product.description}
                                                </p>
                                                <p className="text-xl font-bold text-primary mb-3">
                                                    ${product.price.toFixed(1)}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={() =>
                                                            handleQuantityChange(product.id, -1)
                                                        }
                                                        disabled={quantity === 0}
                                                    >
                                                        <IconMinus className="size-4" />
                                                    </Button>
                                                    <span className="w-8 text-center font-medium">
                                                        {quantity}
                                                    </span>
                                                    <Button
                                                        variant="default"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={() =>
                                                            handleQuantityChange(product.id, 1)
                                                        }
                                                    >
                                                        <IconPlus className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Invoice Sidebar */}
            <div className="w-96 bg-card rounded-lg shadow-lg p-6 flex flex-col h-fit sticky top-6 border">
                {/* Invoice Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Invoice</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.quantity}x
                                        {item.note && ` • ${item.note}`}
                                    </p>
                                    <p className="text-sm font-semibold mt-1">
                                        ${item.price.toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sub Total</span>
                            <span className="font-medium">${subtotal.toFixed(1)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-medium text-red-600">-${discountAmount.toFixed(1)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-medium">${tax.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                            <span>Total Payment</span>
                            <span>${total.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/50">
                        <IconCash className="size-6 text-primary" />
                        <div>
                            <p className="font-medium text-sm">Payment Method</p>
                            <p className="text-xs text-muted-foreground">Cash Payment</p>
                        </div>
                    </div>
                </div>

                {/* Place Order Button */}
                <Button
                    className="w-full py-6 text-lg font-semibold"
                    disabled={cartItems.length === 0 || isLoading}
                    onClick={handlePlaceOrder}
                >
                    Place An Order
                </Button>
            </div>

            {/* Transaction Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Transaction</DialogTitle>
                        <DialogDescription>
                            Please fill in the transaction details before placing the order
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitTransaction} className="space-y-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="customer_name">
                                    Customer Name
                                    {formData.is_credit && (
                                        <span className="text-destructive ml-1">*</span>
                                    )}
                                </FieldLabel>
                                <Input
                                    id="customer_name"
                                    type="text"
                                    placeholder={
                                        formData.is_credit
                                            ? 'Enter customer name (required)'
                                            : 'Enter customer name (optional)'
                                    }
                                    value={formData.customer_name}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            customer_name: e.target.value,
                                        }))
                                    }
                                    disabled={isLoading}
                                    required={formData.is_credit}
                                />
                                <FieldDescription>
                                    {formData.is_credit
                                        ? 'Customer name is required for credit transactions'
                                        : 'Leave empty for walk-in customer'}
                                </FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="discount">Discount</FieldLabel>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.discount}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            discount: Number(e.target.value) || 0,
                                        }))
                                    }
                                    disabled={isLoading}
                                />
                                <FieldDescription>
                                    Enter discount amount (if any)
                                </FieldDescription>
                            </Field>
                            <Field>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="is_credit" className="text-sm font-medium">
                                            Credit Transaction (Kasbon)
                                        </Label>
                                        <FieldDescription>
                                            Enable for credit transactions
                                        </FieldDescription>
                                    </div>
                                    <Switch
                                        id="is_credit"
                                        checked={formData.is_credit}
                                        onCheckedChange={(checked) => {
                                            const currentTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                                            const currentDiscount = Number(formData.discount) || 0
                                            const currentSubtotal = Math.max(0, currentTotal - currentDiscount)
                                            const currentTax = currentSubtotal * 0.04
                                            const currentTotalAmount = currentSubtotal + currentTax

                                            setFormData((prev) => ({
                                                ...prev,
                                                is_credit: checked,
                                                paid_amount: checked ? (prev.paid_amount || 0) : currentTotalAmount,
                                            }))
                                        }}
                                        disabled={isLoading}
                                    />
                                </div>
                            </Field>
                            {formData.is_credit && (
                                <Field>
                                    <FieldLabel htmlFor="paid_amount">Paid Amount</FieldLabel>
                                    <Input
                                        id="paid_amount"
                                        type="number"
                                        min="0"
                                        max={total}
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.paid_amount}
                                        onChange={(e) => {
                                            const paid = Number(e.target.value) || 0
                                            setFormData((prev) => ({
                                                ...prev,
                                                paid_amount: Math.min(paid, total),
                                            }))
                                        }}
                                        disabled={isLoading}
                                    />
                                    <FieldDescription>
                                        Amount paid by customer (max: ${total.toFixed(1)})
                                    </FieldDescription>
                                </Field>
                            )}
                        </FieldGroup>

                        {/* Order Summary in Dialog */}
                        <div className="p-4 rounded-lg border border-border bg-muted/30">
                            <h3 className="font-semibold mb-3">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sub Total</span>
                                    <span>${subtotal.toFixed(1)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span className="text-red-600">-${discountAmount.toFixed(1)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax (4%)</span>
                                    <span>${tax.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border font-bold">
                                    <span>Total Payment</span>
                                    <span>${total.toFixed(1)}</span>
                                </div>
                                {formData.is_credit && (
                                    <>
                                        <div className="flex justify-between pt-2 border-t border-border">
                                            <span className="text-muted-foreground">Paid Amount</span>
                                            <span>${paidAmount.toFixed(1)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Due Amount</span>
                                            <span className="font-bold text-orange-600">
                                                ${dueAmount.toFixed(1)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <IconLoader className="size-4 animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Order'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    )
}
