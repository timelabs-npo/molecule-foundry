const NATIVE_WORKFLOW_PATH = '.github/workflows/ios-testflight.yml';
const NATIVE_WORKFLOW_NAME = 'iOS validation and TestFlight';

/** A successful security or web workflow is not evidence of native validation. */
export function selectLatestNativeValidation(runs = []) {
  return runs
    .filter(run => run.path
      ? run.path.split('@')[0] === NATIVE_WORKFLOW_PATH
      : run.name === NATIVE_WORKFLOW_NAME)
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))[0] || null;
}

export function nativeValidationPassed(run) {
  return !!run && run.status === 'completed' && run.conclusion === 'success';
}
