# Project explanation for presentation

## Problem

Language differences make everyday communication, learning, and travel harder. A user may know what they want to say but still need help expressing it in another language.

## Solution

Transo provides a focused translation workspace. A user writes naturally, selects the language pair, and receives a translated response without creating an account. The result can be copied, downloaded, or spoken by the browser.

## AI/API integration

Transo integrates with a real cloud translation service through a backend API. The browser never receives the provider credential. The server validates requests, handles long input in chunks, calls the provider, and returns the result.

## Engineering decisions

- OpenAPI keeps the API contract in one place.
- Zod validates requests at the server boundary.
- Chunking avoids sending very long text blindly.
- Rate limiting reduces accidental provider cost.
- Local storage keeps basic history out of the server database.
- The interface includes loading, empty, error, and success states.

## Limitations

Translation quality depends on the provider and language pair. Browser speech voices vary by device. High-stakes legal, medical, financial, or emergency communication should be checked by a qualified human.

## Demo flow

1. Open Transo.
2. Paste: `Hello, it is nice to meet you.`
3. Leave the source language on Detect language.
4. Choose Spanish as the target.
5. Press Translate.
6. Show the result.
7. Demonstrate Copy, Download, and Listen.
8. Switch to another target language and show the responsive layout.