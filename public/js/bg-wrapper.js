// Wrapper for bg.js with WebGPU fallback
(async () => {
  try {
    // Check if WebGPU is available
    if (!navigator.gpu) {
      console.warn('WebGPU not supported on this device. Using static background.');
      document.documentElement.setAttribute('data-no-webgpu', 'true');
      const canvas = document.querySelector('#bg-canvas');
      if (canvas) {
        canvas.style.display = 'none';
      }
      return;
    }
    
    // Load bg.js if WebGPU is available
    await import('./bg.js').catch(err => {
      console.error('Failed to load 3D background:', err);
      document.documentElement.setAttribute('data-no-webgpu', 'true');
      // Hide canvas on error
      const canvas = document.querySelector('#bg-canvas');
      if (canvas) {
        canvas.style.display = 'none';
      }
    });
  } catch (err) {
    console.error('Error initializing background:', err);
    document.documentElement.setAttribute('data-no-webgpu', 'true');
    // Hide canvas on error
    const canvas = document.querySelector('#bg-canvas');
    if (canvas) {
      canvas.style.display = 'none';
    }
  }
})();
