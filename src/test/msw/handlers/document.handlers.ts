import { HttpResponse, http } from "msw";
import { documentFixture } from "../../mocks/fixtures/document.fixture";

export const documentHandlers = [
  http.get("*/documents", ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (!type) {
      throw new Error("GET /documents requer query param type.");
    }

    return HttpResponse.json(documentFixture.list);
  }),
  http.post("*/documents", () => new HttpResponse(null, { status: 201 })),
  http.get("*/documents/:documentId", () =>
    new HttpResponse(documentFixture.fileContent, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="contracheque.pdf"',
      },
    })
  ),
  http.delete("*/documents/:documentId", () => new HttpResponse(null, { status: 204 })),
];
