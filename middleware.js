const ROOT_TRACKING_PARAMS = ['from', 'kcal', 'supermarket'];

export const config = {
  matcher: '/',
};

export default function middleware(request) {
  const url = new URL(request.url);

  if (ROOT_TRACKING_PARAMS.some(param => url.searchParams.has(param))) {
    url.search = '';
    url.hash = '';
    url.hostname = 'www.mealprep.org.uk';
    url.protocol = 'https:';
    return Response.redirect(url, 308);
  }
}
