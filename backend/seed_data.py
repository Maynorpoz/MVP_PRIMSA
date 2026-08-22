"""
Script de seed para poblar la base de datos con datos de ejemplo.
Productos: Repuestos de motocicletas
Usuarios: 4 customers
Órdenes: 25 órdenes con order_items

Para ejecutar:
    python seed_data.py
"""
import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models.db_models import Base, Order, OrderItem, Product, User, UserRoleEnum


def create_products(db: Session) -> list[Product]:
    """Crear productos de repuestos de motocicletas."""
    products_data = [
        {
            "name": "Pastillas de Freno Delanteras",
            "description": "Pastillas de freno cerámicas de alta durabilidad para disco delantero",
            "price": Decimal("45.99"),
            "stock": 50,
        },
        {
            "name": "Cadena de Transmisión 520",
            "description": "Cadena reforzada 520 x 120 eslabones, oro/negro",
            "price": Decimal("89.99"),
            "stock": 30,
        },
        {
            "name": "Filtro de Aceite Premium",
            "description": "Filtro de aceite de alto rendimiento compatible con mayoría de motos",
            "price": Decimal("12.50"),
            "stock": 100,
        },
        {
            "name": "Bujías NGK Iridium (Pack x4)",
            "description": "Set de 4 bujías de iridio NGK de larga duración",
            "price": Decimal("38.00"),
            "stock": 60,
        },
        {
            "name": "Neumático Trasero 180/55 R17",
            "description": "Neumático deportivo trasero marca Michelin Pilot Street",
            "price": Decimal("185.00"),
            "stock": 20,
        },
        {
            "name": "Neumático Delantero 120/70 R17",
            "description": "Neumático deportivo delantero marca Michelin Pilot Street",
            "price": Decimal("165.00"),
            "stock": 25,
        },
        {
            "name": "Espejo Retrovisor Derecho",
            "description": "Espejo retrovisor universal cromado con rosca estándar M10",
            "price": Decimal("18.50"),
            "stock": 40,
        },
        {
            "name": "Espejo Retrovisor Izquierdo",
            "description": "Espejo retrovisor universal cromado con rosca estándar M10",
            "price": Decimal("18.50"),
            "stock": 40,
        },
        {
            "name": "Aceite Motor 10W-40 Sintético (1L)",
            "description": "Aceite sintético premium 4T para motores de motocicleta",
            "price": Decimal("22.99"),
            "stock": 80,
        },
        {
            "name": "Batería YTX9-BS 12V 8Ah",
            "description": "Batería sellada libre de mantenimiento para moto",
            "price": Decimal("75.00"),
            "stock": 15,
        },
        {
            "name": "Kit de Manetas de Freno y Clutch",
            "description": "Par de manetas ajustables CNC aluminio anodizado",
            "price": Decimal("55.00"),
            "stock": 35,
        },
        {
            "name": "Faro LED H4 6000K",
            "description": "Bombilla LED ultra brillante blanca 6000K, 35W",
            "price": Decimal("28.00"),
            "stock": 45,
        },
        {
            "name": "Kit de Embrague Completo",
            "description": "Set completo de discos de embrague y resortes",
            "price": Decimal("125.00"),
            "stock": 12,
        },
        {
            "name": "Pastillas de Freno Traseras",
            "description": "Pastillas de freno orgánicas para disco trasero",
            "price": Decimal("35.50"),
            "stock": 55,
        },
        {
            "name": "Filtro de Aire de Alto Flujo",
            "description": "Filtro de aire K&N lavable y reutilizable",
            "price": Decimal("68.00"),
            "stock": 28,
        },
        {
            "name": "Grip Puños de Manillar",
            "description": "Par de puños ergonómicos antideslizantes negro/rojo",
            "price": Decimal("15.99"),
            "stock": 70,
        },
        {
            "name": "Soporte para Celular Universal",
            "description": "Soporte ajustable para smartphone con carga USB",
            "price": Decimal("32.00"),
            "stock": 50,
        },
        {
            "name": "Cubierta Protectora Impermeable",
            "description": "Funda completa impermeable talla L (hasta 250cc)",
            "price": Decimal("42.00"),
            "stock": 25,
        },
    ]

    products = []
    for prod_data in products_data:
        product = Product(**prod_data)
        db.add(product)
        products.append(product)

    db.commit()
    print(f"✓ Creados {len(products)} productos de repuestos de motocicletas")
    return products


def create_customers(db: Session) -> list[User]:
    """Crear 4 usuarios con rol customer_role."""
    customers_data = [
        {
            "email": "carlos.mendez@email.com",
            "password": "Cliente123!",
            "name": "Carlos Méndez",
        },
        {
            "email": "maria.rodriguez@email.com",
            "password": "MotoRider456!",
            "name": "María Rodríguez",
        },
        {
            "email": "jose.ramirez@email.com",
            "password": "Biker789!",
            "name": "José Ramírez",
        },
        {
            "email": "ana.martinez@email.com",
            "password": "Speed2024!",
            "name": "Ana Martínez",
        },
    ]

    customers = []
    for customer_data in customers_data:
        customer = User(
            email=customer_data["email"],
            hashed_password=hash_password(customer_data["password"]),
            role=UserRoleEnum.customer_role,
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 180)),
        )
        db.add(customer)
        customers.append(customer)

    db.commit()
    print(f"✓ Creados {len(customers)} clientes")
    print("  Credenciales de clientes:")
    for cdata in customers_data:
        print(f"    - {cdata['email']} / {cdata['password']}")

    return customers


def create_orders_with_items(
    db: Session, customers: list[User], products: list[Product]
) -> None:
    """Crear 25 órdenes con sus respectivos order_items."""
    order_statuses = ["created", "processing", "completed", "cancelled"]

    for i in range(25):
        # Seleccionar un cliente aleatorio
        customer = random.choice(customers)

        # Fecha aleatoria en los últimos 60 días
        order_date = datetime.utcnow() - timedelta(days=random.randint(0, 60))

        # Seleccionar status (más probabilidad de completed)
        status = random.choices(
            order_statuses,
            weights=[10, 20, 60, 10],  # 60% completed, 20% processing, etc.
            k=1
        )[0]

        # Crear la orden sin total por ahora
        order = Order(
            user_id=customer.id,
            status=status,
            total=Decimal("0.00"),
            created_at=order_date,
        )
        db.add(order)
        db.flush()  # Para obtener el order.id

        # Crear entre 1 y 5 items por orden
        num_items = random.randint(1, 5)
        selected_products = random.sample(products, min(num_items, len(products)))

        order_total = Decimal("0.00")

        for product in selected_products:
            quantity = random.randint(1, 3)
            unit_price = product.price

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
            )
            db.add(order_item)

            # Acumular el total
            order_total += unit_price * quantity

        # Actualizar el total de la orden
        order.total = order_total

    db.commit()
    print(f"✓ Creadas 25 órdenes con sus order_items distribuidas entre los clientes")


def seed_database():
    """Función principal para ejecutar el seed completo."""
    print("\n Iniciando seed de base de datos...\n")

    # Crear sesión
    db = SessionLocal()

    try:
        # Verificar si ya hay datos
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print(f"La base de datos ya tiene {existing_products} productos.")
            response = input("¿Desea continuar y agregar más datos? (s/n): ")
            if response.lower() != 's':
                print("❌ Seed cancelado")
                return

        # Crear datos
        products = create_products(db)
        customers = create_customers(db)
        create_orders_with_items(db, customers, products)

        # Resumen
        total_orders = db.query(Order).count()
        total_items = db.query(OrderItem).count()

        print("\n" + "="*60)
        print("Seed completado exitosamente!")
        print("="*60)
        print(f"Productos creados: {len(products)}")
        print(f"Clientes creados: {len(customers)}")
        print(f"Órdenes creadas: {total_orders}")
        print(f"Order items creados: {total_items}")
        print("="*60 + "\n")

    except Exception as e:
        print(f"\nError durante el seed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
