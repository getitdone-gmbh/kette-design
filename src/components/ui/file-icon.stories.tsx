import type { Meta, StoryObj } from '@storybook/react';

import { FileIcon } from './file-icon';
import { DesignSystemProvider } from './design-system-provider';

const meta = {
  title: 'Data display/File icon',
  component: FileIcon,
  tags: ['autodocs'],
  args: { name: 'contract.pdf', size: 'md' },
  argTypes: { size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof FileIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Kinds: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {['report.pdf', 'letter.docx', 'budget.xlsx', 'deck.pptx', 'photo.png', 'clip.mp4', 'bundle.zip', 'app.ts', 'notes.xyz'].map((name) => (
        <FileIcon key={name} name={name} size="lg" />
      ))}
      <FileIcon kind="folder" size="lg" />
    </div>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <FileIcon ext="pdf" size="sm" />
      <FileIcon ext="pdf" size="md" />
      <FileIcon ext="pdf" size="lg" />
    </div>
  ),
};
export const FourCharExtensions: Story = {
  parameters: { docs: { description: { story: 'Four character extensions such as DOCX, XLSX and PPTX fit the label at md and lg without truncating.' } } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {['docx', 'xlsx', 'pptx', 'webm'].map((ext) => (
        <FileIcon key={`md-${ext}`} ext={ext} size="md" />
      ))}
      {['docx', 'xlsx', 'pptx', 'webm'].map((ext) => (
        <FileIcon key={`lg-${ext}`} ext={ext} size="lg" />
      ))}
    </div>
  ),
};
export const UploadFailed: Story = { args: { error: true, decorative: false } };

// Product look of the workload.zero apps: the preset switches the component defaults (set it once at the app root).
export const ZeroPreset: Story = {
  decorators: [
    (Story) => (
      <DesignSystemProvider preset="zero">
        <Story />
      </DesignSystemProvider>
    ),
  ],
};
