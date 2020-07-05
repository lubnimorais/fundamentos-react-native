import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const produtos = await AsyncStorage.getItem('@Marketplace:products');

      if (produtos) {
        setProducts([...JSON.parse(produtos)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const produtoTemCarrinho = products.find(prod => prod.id === product.id);

      if (produtoTemCarrinho) {
        const produtos = products.map(prod =>
          prod.id === product.id
            ? { ...product, quantity: prod.quantity + 1 }
            : prod,
        );

        setProducts(produtos);
      } else {
        const adicionarNovoProduto = [...products, { ...product, quantity: 1 }];
        setProducts(adicionarNovoProduto);
      }

      await AsyncStorage.setItem(
        '@Marketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const produtos = products.map(prod =>
        prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod,
      );

      setProducts(produtos);

      await AsyncStorage.setItem(
        '@Marketplace:products',
        JSON.stringify(produtos),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const produtos = products.map(prod =>
        prod.id === id ? { ...prod, quantity: prod.quantity - 1 } : prod,
      );
      // .filter(p => p.quantity !== 0);

      setProducts(produtos);

      await AsyncStorage.setItem(
        '@Marketplace:products',
        JSON.stringify(produtos),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
