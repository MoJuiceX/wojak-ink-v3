/**
 * Shop Page
 *
 * Browse and purchase items with oranges or gems.
 */

import { PageTransition } from '@/components/layout/PageTransition';
import { Shop as ShopComponent } from '@/components/Shop';

const Shop = () => {
  return (
    <PageTransition>
      <div className="min-h-full">
        <ShopComponent />
      </div>
    </PageTransition>
  );
};

export default Shop;
