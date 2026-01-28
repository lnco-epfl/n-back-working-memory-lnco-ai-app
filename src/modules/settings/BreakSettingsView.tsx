import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import { BreakSettingsType } from '../context/SettingsContext';

type BreakSettingsViewProps = {
  breakSettings: BreakSettingsType;
  onChange: (newSetting: BreakSettingsType) => void;
};

const BreakSettingsView: FC<BreakSettingsViewProps> = ({
  breakSettings,
  onChange,
}) => {
  const { t } = useTranslation();

  const handleChange = (
    setting: keyof BreakSettingsType,
    value: unknown,
  ): void => {
    onChange({
      ...breakSettings,
      [setting]: value,
    });
  };

  return (
    <Stack spacing={2} padding={2}>
      <Typography variant="h6">{t('SETTINGS.BREAK_TITLE')}</Typography>

      <FormControlLabel
        control={
          <Switch
            checked={breakSettings.enableBreaks}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('enableBreaks', e.target.checked)
            }
          />
        }
        label={t('SETTINGS.ENABLE_BREAKS')}
      />

      {breakSettings.enableBreaks && (
        <>
          <TextField
            fullWidth
            type="number"
            label={t('SETTINGS.BREAK_FREQUENCY')}
            helperText={t('SETTINGS.BREAK_FREQUENCY_HELP')}
            value={breakSettings.breakFrequency}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('breakFrequency', parseInt(e.target.value, 10))
            }
            inputProps={{ min: 5, max: 100 }}
          />

          <TextField
            fullWidth
            type="number"
            label={t('SETTINGS.BREAK_DURATION')}
            helperText={t('SETTINGS.BREAK_DURATION_HELP')}
            value={breakSettings.breakDuration}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('breakDuration', parseInt(e.target.value, 10))
            }
            inputProps={{ min: 10, max: 300 }}
          />
        </>
      )}
    </Stack>
  );
};

export default BreakSettingsView;
