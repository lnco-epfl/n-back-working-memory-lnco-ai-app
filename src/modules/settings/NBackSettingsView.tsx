import { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { NBackSettingsType } from '../context/SettingsContext';

type NBackSettingsViewProps = {
  nBackSettings: NBackSettingsType;
  onChange: (newSetting: NBackSettingsType) => void;
};

const NBackSettingsView: FC<NBackSettingsViewProps> = ({
  nBackSettings,
  onChange,
}) => {
  const { t } = useTranslation();

  const handleChange = (
    setting: keyof NBackSettingsType,
    value: unknown,
  ): void => {
    onChange({
      ...nBackSettings,
      [setting]: value,
    });
  };

  return (
    <Stack spacing={2} padding={2}>
      <Typography variant="h6">{t('SETTINGS.NBACK_TITLE')}</Typography>

      <FormControl fullWidth>
        <InputLabel>{t('SETTINGS.NBACK_LEVEL')}</InputLabel>
        <Select
          value={nBackSettings.nLevel}
          onChange={(e) =>
            handleChange('nLevel', e.target.value as 1 | 2 | 3 | 4)
          }
          label={t('SETTINGS.NBACK_LEVEL')}
        >
          <MenuItem value={1}>1-back</MenuItem>
          <MenuItem value={2}>2-back</MenuItem>
          <MenuItem value={3}>3-back</MenuItem>
          <MenuItem value={4}>4-back</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        type="number"
        label={t('SETTINGS.NUMBER_OF_TRIALS')}
        value={nBackSettings.numberOfTrials}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('numberOfTrials', parseInt(e.target.value, 10))
        }
        inputProps={{ min: 10, max: 200 }}
      />

      <TextField
        fullWidth
        type="number"
        label={t('SETTINGS.NUMBER_OF_PRACTICE_TRIALS')}
        value={nBackSettings.numberOfPracticeTrials}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('numberOfPracticeTrials', parseInt(e.target.value, 10))
        }
        inputProps={{ min: 5, max: 50 }}
      />

      <TextField
        fullWidth
        type="number"
        label={t('SETTINGS.DISPLAY_DURATION')}
        helperText={t('SETTINGS.DISPLAY_DURATION_HELP')}
        value={nBackSettings.displayDuration}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('displayDuration', parseInt(e.target.value, 10))
        }
        inputProps={{ min: 100, max: 2000, step: 50 }}
      />

      <TextField
        fullWidth
        type="number"
        label={t('SETTINGS.ISI')}
        helperText={t('SETTINGS.ISI_HELP')}
        value={nBackSettings.interStimulusInterval}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('interStimulusInterval', parseInt(e.target.value, 10))
        }
        inputProps={{ min: 500, max: 5000, step: 100 }}
      />

      <FormControl fullWidth>
        <InputLabel>{t('SETTINGS.RESPONSE_KEY')}</InputLabel>
        <Select
          value={nBackSettings.responseKey}
          onChange={(e) => handleChange('responseKey', e.target.value)}
          label={t('SETTINGS.RESPONSE_KEY')}
        >
          <MenuItem value="space">{t('SETTINGS.SPACEBAR_ONLY')}</MenuItem>
          <MenuItem value="mouse">{t('SETTINGS.MOUSE_ONLY')}</MenuItem>
          <MenuItem value="both">{t('SETTINGS.SPACEBAR_OR_MOUSE')}</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={3}
        label={t('SETTINGS.CUSTOM_PRACTICE_SEQUENCE')}
        helperText={t('SETTINGS.CUSTOM_PRACTICE_SEQUENCE_HELP')}
        value={nBackSettings.customPracticeSequence}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('customPracticeSequence', e.target.value)
        }
        placeholder="3,5,2,5,7,8,5,..."
      />

      <TextField
        fullWidth
        multiline
        rows={3}
        label={t('SETTINGS.CUSTOM_SEQUENCE')}
        helperText={t('SETTINGS.CUSTOM_SEQUENCE_HELP')}
        value={nBackSettings.customSequence}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange('customSequence', e.target.value)
        }
        placeholder="3,5,2,5,7,8,5,..."
      />
    </Stack>
  );
};

export default NBackSettingsView;
