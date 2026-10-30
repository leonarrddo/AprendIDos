import { handleFacebookDataDeletionStatus } from '../lib/facebook-data-deletion.js';

export default function facebookDataDeletionStatus(req, res) {
  return handleFacebookDataDeletionStatus(req, res);
}
