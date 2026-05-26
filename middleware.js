const ROOT_TRACKING_PARAMS = ['from', 'kcal', 'supermarket'];

export const config = {
  matcher: '/',
};

export default function middleware(request) {
  const url = new URL(request.url);

  if (ROOT_TRACKING_PARAMS.some(param => url.searchParams.has(param))) {
    return new Response(null, {
      status: 308,
      headers: {
        Location: '/',
      },
    });
  }
}
