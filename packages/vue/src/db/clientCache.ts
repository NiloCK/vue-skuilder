// todo: something good here instead

const CLIENT_CACHE: {
  [k: string]: any;
} = {};

export async function GET_CACHED<K>(k: string, f?: (x: string) => Promise<K>): Promise<K> {
  if (CLIENT_CACHE[k]) {
    // console.log('returning a cached item');
    return CLIENT_CACHE[k];
  }

  CLIENT_CACHE[k] = f ? await f(k) : await GET_ITEM(k);
  return GET_CACHED(k);
}

async function GET_ITEM(k: string): Promise<any> {
  throw new Error(`No implementation found for GET_CACHED(${k})`);
}
