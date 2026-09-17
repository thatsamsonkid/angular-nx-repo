import { defineUiButton } from '@angular-nx-repo/ui/button';
import { wireButtonDemo } from './demo';

defineUiButton()
  .then(() => wireButtonDemo())
  .catch((error) => console.error(error));
