# Serving Unity Builds

This document explains how to deploy a built Unity project with the Next.js frontend and the Django backend used in the LLM Sandbox.

## Build the Unity Project

1. Open the Unity project located in the `Unity/` directory using **Unity Hub**.
2. In **File > Build Settings**, select the **WebGL** target (or your preferred platform) and click **Build**.
3. Choose an output directory outside the repository (e.g., `~/UnityBuild/`). Unity creates files such as `index.html`, a `Build/` folder, and `TemplateData/`.

## Copy Files to `public/UnityBuild/`

After building, copy the generated files into the `public/UnityBuild/` directory of this repository:

```bash
cp -r ~/UnityBuild/* public/UnityBuild/
```

Anything inside `public/` is served statically by Next.js, so the Unity build will be accessible under `/UnityBuild/` on the web server.

## Referencing the Build

You can reference the Unity build from the web application or the Django server using a regular URL. For example, in a Next.js page:

```tsx
export default function UnityPage() {
  return (
    <iframe
      src="/UnityBuild/index.html"
      width="100%"
      height="800"
      style={{ border: "none" }}
    />
  );
}
```

The build can also be linked directly from any page using `<a href="/UnityBuild/index.html">Launch Unity</a>`.

When served through the Django backend, the static file path is the same, so `/UnityBuild/index.html` works regardless of whether the frontend or backend is serving the request.
