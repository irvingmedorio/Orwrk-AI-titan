import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { useTranslation } from '../lib/i18n';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onReject: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onReject }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{t('actionRequired')}</CardTitle>
          <CardDescription>{t('agentApproval')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end space-x-4">
            <Button variant="destructive" onClick={onReject}>
              {t('reject')}
            </Button>
            <Button variant="primary" onClick={onConfirm}>
              {t('approve')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationModal;