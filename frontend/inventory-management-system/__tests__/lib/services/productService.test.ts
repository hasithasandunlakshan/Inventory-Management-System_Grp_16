import { productService } from '@/lib/services/productService';

const mockFetch = jest.fn();

describe('productService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // @ts-ignore
    global.fetch = mockFetch;
  });

  it('getAllProducts returns data on 200', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: '1' }],
    });
    const res = await productService.getAllProducts();
    expect(res).toEqual([{ id: '1' }]);
    expect(mockFetch).toHaveBeenCalled();
  });

  it('getAllProducts throws on non-ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });
    await expect(productService.getAllProducts()).rejects.toThrow(
      /Failed to fetch products/
    );
  });

  it('getProductById returns data on 200', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '7' }),
    });
    const res = await productService.getProductById('7');
    expect(res).toEqual({ id: '7' });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/7$/));
  });

  it('getProductById throws 404 as not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    await expect(productService.getProductById('x')).rejects.toThrow(
      'Product not found'
    );
  });

  it('addProduct posts body and returns created', async () => {
    const body = { name: 'A', description: 'B', price: 1, stock: 1 } as any;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new', ...body }),
    });
    const res = await productService.addProduct(body);
    expect(res.id).toBe('new');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('deleteProduct calls DELETE and throws on failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    await expect(productService.deleteProduct(1)).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/1$/),
      expect.objectContaining({ method: 'DELETE' })
    );

    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(productService.deleteProduct(1)).rejects.toThrow(
      /Failed to delete product/
    );
  });

  it('updateProduct calls PUT and returns updated', async () => {
    const product = {
      id: 'u1',
      name: 'X',
      description: 'Y',
      price: 1,
      stock: 1,
    } as any;
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => product });
    const res = await productService.updateProduct(product);
    expect(res).toEqual(product);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/u1$/),
      expect.objectContaining({ method: 'PUT' })
    );

    mockFetch.mockResolvedValueOnce({ ok: false });
    await expect(productService.updateProduct(product)).rejects.toThrow(
      /Failed to update product/
    );
  });
});
