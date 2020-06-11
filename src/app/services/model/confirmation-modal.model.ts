import { Subject } from 'rxjs';
export interface IConfirmationModal {
  destroy$?: Subject<boolean>;
  open?: boolean;
  id?: string;
}