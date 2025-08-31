import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../lib/i18n';
import { useAgentStore } from '../store/agentStore';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { ApiIntegrationId } from '../types';
import { GoogleIcon, MicrosoftIcon, SlackIcon, GithubIcon, NotionIcon } from '../components/icons';

const IntegrationIcon: React.FC<{ id: ApiIntegrationId }> = ({ id }) => {
    switch (id) {
        case ApiIntegrationId.GOOGLE_WORKSPACE: return <GoogleIcon />;
        case ApiIntegrationId.MICROSOFT_365: return <MicrosoftIcon />;
        case ApiIntegrationId.SLACK: return <SlackIcon />;
        case ApiIntegrationId.GITHUB: return <GithubIcon />;
        case ApiIntegrationId.NOTION: return <NotionIcon />;
        default: return null;
    }
};

const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const { 
    language, 
    setLanguage,
    downloadPath,
    useDefaultDownloadPath,
    setDownloadPath,
    toggleUseDefaultDownloadPath,
    apiIntegrations,
    toggleApiConnection
  } = useAgentStore();
  const [downloadPathMessage, setDownloadPathMessage] = useState('');

  const handleChangePath = () => {
    const newPath = window.prompt(t('enterNewPathPrompt'), downloadPath);
    setDownloadPathMessage('');
    if (newPath) {
        // Simple validation simulation
        if (newPath.trim().length > 3 && (newPath.startsWith('/') || newPath.match(/^[a-zA-Z]:\\/))) {
            setDownloadPath(newPath);
            setDownloadPathMessage(t('downloadPathUpdated', newPath));
        } else {
            setDownloadPathMessage(t('downloadPathError'));
        }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('settingsTitle')}</h2>
        <p className="text-dark-muted-foreground">{t('settingsDesc')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('language')}</CardTitle>
          <CardDescription>{t('languageDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex space-x-4">
          <Button onClick={() => setLanguage('en')} variant={language === 'en' ? 'primary' : 'outline'}>
            English
          </Button>
          <Button onClick={() => setLanguage('es')} variant={language === 'es' ? 'primary' : 'outline'}>
            Español
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('apiKeys')}</CardTitle>
          <CardDescription>{t('apiKeysDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <label htmlFor="gemini-key" className="w-full sm:w-32 sm:text-right font-medium">{t('geminiKey')}</label>
            <Input id="gemini-key" type="password" placeholder="Enter your Gemini API key" className="flex-1" />
            <Button>{t('save')}</Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <label htmlFor="gpt-key" className="w-full sm:w-32 sm:text-right font-medium">{t('gptKey')}</label>
            <Input id="gpt-key" type="password" placeholder="Enter your OpenAI GPT key" className="flex-1" />
            <Button>{t('save')}</Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <label htmlFor="claude-key" className="w-full sm:w-32 sm:text-right font-medium">{t('claudeKey')}</label>
            <Input id="claude-key" type="password" placeholder="Enter your Claude API key" className="flex-1" />
            <Button>{t('save')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('cloudConnections')}</CardTitle>
          <CardDescription>{t('cloudConnectionsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiIntegrations.map(integration => (
              <div key={integration.id} className="flex items-center justify-between p-4 border border-dark-border rounded-lg">
                <div className="flex items-center space-x-4">
                    <IntegrationIcon id={integration.id} />
                    <div>
                        <p className="font-semibold">{t(integration.id as any)}</p>
                        <p className={`text-sm ${integration.isConnected ? 'text-green-400' : 'text-dark-muted-foreground'}`}>
                            {integration.isConnected ? t('connected') : t('notConnected')}
                        </p>
                    </div>
                </div>
                <Button 
                    variant={integration.isConnected ? 'destructive' : 'primary'}
                    onClick={() => toggleApiConnection(integration.id)}
                >
                    {integration.isConnected ? t('disconnect') : t('connect')}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-dark-border">
            <CardTitle className="text-base mb-2">{t('defaultDownloadLocation')}</CardTitle>
            <CardDescription className="mb-4">{t('defaultDownloadLocationDesc')}</CardDescription>
            <div className="flex items-center justify-between mb-4 p-4 border border-dark-border rounded-lg">
                <label htmlFor="use-default-folder" className="font-medium">{t('useDefaultDownloadFolder')}</label>
                <ToggleSwitch checked={useDefaultDownloadPath} onChange={() => toggleUseDefaultDownloadPath()} />
            </div>
            <div className={`space-y-2 transition-opacity ${!useDefaultDownloadPath ? 'opacity-50 pointer-events-none' : ''}`}>
                <label className="font-medium text-sm text-dark-muted-foreground">{t('saveTo')}</label>
                <div className="flex items-center space-x-2">
                    <Input readOnly value={downloadPath} className="flex-1 bg-dark-background" />
                    <Button variant="outline" onClick={handleChangePath} disabled={!useDefaultDownloadPath}>{t('change')}</Button>
                </div>
                {downloadPathMessage && (
                    <p className={`text-sm mt-2 ${downloadPathMessage.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                        {downloadPathMessage}
                    </p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;