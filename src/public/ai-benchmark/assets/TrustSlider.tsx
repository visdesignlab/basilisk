import { Slider, Space, Stack } from '@mantine/core';

function TrustSlider({
  trustValue,
  setTrustValue,
}: {
  trustValue: number;
  setTrustValue: ((value: number) => void) | undefined;
}) {
  return (
    <Stack>
      <Slider
        pl={50}
        pr={50}
        size="xl"
        value={trustValue}
        onChange={setTrustValue}
        styles={{
          markLabel: {
            whiteSpace: 'pre-line',
            width: 'min(130px, 7vw)',
            fontSize: 'min(var(--mantine-font-size-sm), 0.8vw)',
            textAlign: 'center',
            color: 'black',
          },
          mark: {
            backgroundColor: 'var(--mantine-color-gray-2)',
            borderColor: 'var(--mantine-color-gray-2)',
          },
          bar: { backgroundColor: 'var(--mantine-color-gray-2)' },
        }}
        marks={[
          { label: 'Not at all trustworthy', value: 0 },
          { label: 'A small degree of trustworthiness', value: 16 },
          { label: 'A limited amount of trustworthiness', value: 33 },
          { label: 'To some extent trustworthy', value: 50 },
          { label: 'A moderate amount of trustworthiness', value: 66 },
          { label: 'A great deal of trustworthiness', value: 83 },
          { label: 'Completely trustworthy', value: 100 },
        ]}
      />
      <Space h="xl" />
    </Stack>
  );
}

export default TrustSlider;