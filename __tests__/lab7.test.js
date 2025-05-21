describe('Basic user flow for Website', () => {
  // First, visit the lab 7 website
  beforeAll(async () => {
    await page.goto('https://cse110-sp25.github.io/CSE110-Shop/');
  });

  // Each it() call is a separate test
  // Here, we check to make sure that all 20 <product-item> elements have loaded
  it('Initial Home Page - Check for 20 product items', async () => {
    console.log('Checking for 20 product items...');

    // Query select all of the <product-item> elements and return the length of that array
    const numProducts = await page.$$eval('product-item', (prodItems) => {
      return prodItems.length;
    });

    // Expect there that array from earlier to be of length 20, meaning 20 <product-item> elements where found
    expect(numProducts).toBe(20);
  });

  // Check to make sure that all 20 <product-item> elements have data in them
  // We use .skip() here because this test has a TODO that has not been completed yet.
  // Make sure to remove the .skip after you finish the TODO. 
  it('Make sure <product-item> elements are populated', async () => {
    console.log('Checking to make sure <product-item> elements are populated...');

    // Start as true, if any don't have data, swap to false
    let allArePopulated = true;

    // Query select all of the <product-item> elements
    const prodItemsData = await page.$$eval('product-item', prodItems => {
      return prodItems.map(item => {
        // Grab all of the json data stored inside
        return data = item.data;
      });
    });

    // Check each product item for populated data
    for (const item of prodItemsData) {
      if (item.title.length === 0 || item.price.length === 0 || item.image.length === 0) {
        allArePopulated = false;
        break;
      }
    }

    // Expect allArePopulated to still be true
    expect(allArePopulated).toBe(true);

    /**
    **** TODO - STEP 1 ****
    * Right now this function is only checking the first <product-item> it found, make it so that
      it checks every <product-item> it found
    * Remove the .skip from this it once you are finished writing this test.
    */

  }, 10000);

  // Check to make sure that when you click "Add to Cart" on the first <product-item> that
  // the button swaps to "Remove from Cart"
  it('Clicking the "Add to Cart" button should change button text', async () => {
    console.log('Checking the "Add to Cart" button...');

    const productItem = await page.$('product-item');
    
    const button = await productItem.evaluateHandle(item => {
      const shadowRoot = item.shadowRoot;
      return shadowRoot.querySelector('button');
    });

    const initialText = await button.evaluate(btn => btn.innerText);
    expect(initialText).toBe('Add to Cart');

    await button.click();

    const newText = await button.evaluate(btn => btn.innerText);
    expect(newText).toBe('Remove from Cart');

  }, 2500);

  // Check to make sure that after clicking "Add to Cart" on every <product-item> that the Cart
  // number in the top right has been correctly updated
  it('Checking number of items in cart on screen', async () => {
    console.log('Checking number of items in cart on screen...');

    const productItems = await page.$$('product-item');
    console.log(`Found ${productItems.length} product items`);
    
    for (const [i, item] of productItems.entries()) {
      const button = await item.evaluateHandle(item => item.shadowRoot.querySelector('button'));
      const buttonText = await button.evaluate(btn => btn.innerText);
      if (buttonText === 'Add to Cart') {
        await button.click();
        await page.waitForFunction((idx) => {
          const items = document.querySelectorAll('product-item');
          const btn = items[idx].shadowRoot.querySelector('button');
          return btn.innerText === 'Remove from Cart';
        }, {}, i);
      }
    }

    await page.waitForFunction(() => {
      const cartCount = document.querySelector('#cart-count');
      return cartCount && cartCount.innerText === '20';
    });

    const cartCount = await page.$eval('#cart-count', count => count.innerText);
    console.log(`Cart count is: ${cartCount}`);
    expect(cartCount).toBe('20');

  }, 10000);

  // Check to make sure that after you reload the page it remembers all of the items in your cart
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');

    await page.reload();
    await page.waitForSelector('product-item');

    const productItems = await page.$$('product-item');
    let allButtonsCorrect = true;
    for (const [i, item] of productItems.entries()) {
      const button = await item.evaluateHandle(item => item.shadowRoot.querySelector('button'));
      const buttonText = await button.evaluate(btn => btn.innerText);
      if (buttonText !== 'Remove from Cart') {
        console.log(`Item ${i + 1} button text after reload: ${buttonText}`);
        allButtonsCorrect = false;
        break;
      }
    }
    expect(allButtonsCorrect).toBe(true);

    const cartCount = await page.$eval('#cart-count', count => count.innerText);
    console.log(`Cart count after reload: ${cartCount}`);
    expect(cartCount).toBe('20');

  }, 10000);

  // Check to make sure that the cart in localStorage is what you expect
  it('Checking the localStorage to make sure cart is correct', async () => {
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    console.log(`Cart in localStorage: ${cart}`);
    expect(cart).toBe('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]');
  });

  // Checking to make sure that if you remove all of the items from the cart that the cart
  // number in the top right of the screen is 0
  it('Checking number of items in cart on screen after removing from cart', async () => {
    console.log('Checking number of items in cart on screen...');

    const productItems = await page.$$('product-item');
    for (const [i, item] of productItems.entries()) {
      const button = await item.evaluateHandle(item => item.shadowRoot.querySelector('button'));
      const buttonText = await button.evaluate(btn => btn.innerText);
      if (buttonText === 'Remove from Cart') {
        await button.click();
        await page.waitForFunction((idx) => {
          const items = document.querySelectorAll('product-item');
          const btn = items[idx].shadowRoot.querySelector('button');
          return btn.innerText === 'Add to Cart';
        }, {}, i);
      }
    }

    await page.waitForFunction(() => {
      const cartCount = document.querySelector('#cart-count');
      return cartCount && cartCount.innerText === '0';
    });

    const cartCount = await page.$eval('#cart-count', count => count.innerText);
    console.log(`Cart count after removing all: ${cartCount}`);
    expect(cartCount).toBe('0');

  }, 10000);

  // Checking to make sure that it remembers us removing everything from the cart
  // after we refresh the page
  it('Checking number of items in cart on screen after reload', async () => {
    console.log('Checking number of items in cart on screen after reload...');
  
    await page.reload();
  
    const productItems = await page.$$('product-item');
    let allButtonsCorrect = true;
  
    for (const [i, item] of productItems.entries()) {
      const buttonText = await item.evaluate(item =>
        item.shadowRoot.querySelector('button').innerText
      );
  
      if (buttonText !== 'Add to Cart') {
        console.log(`Item ${i + 1} button text after reload: ${buttonText}`);
        allButtonsCorrect = false;
        break;
      }
    }
  
    expect(allButtonsCorrect).toBe(true);
  
    const cartCount = await page.$eval('#cart-count', count => count.innerText);
    console.log(`Cart count after removing all: ${cartCount}`);
    expect(cartCount).toBe('0');
  }, 10000);
  

  // Checking to make sure that localStorage for the cart is as we'd expect for the
  // cart being empty
  it('Checking the localStorage to make sure cart is correct', async () => {
    console.log('Checking the localStorage...');

    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    console.log(`Cart in localStorage: ${cart}`);
    expect(cart).toBe('[]');
    /**
     **** TODO - STEP 8 **** 
     * At this point he item 'cart' in localStorage should be '[]', check to make sure it is
     * Remember to remove the .skip from this it once you are finished writing this test.
     */

  });
});
