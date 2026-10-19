import type { Meta, StoryObj } from '@storybook/react';
import { CheckCircle, FolderClosed, UploadCloud } from 'lucide-react';

import { Avatar, AvatarFallback } from './avatar';
import { Notification, NotificationAction } from './notification';

const meta = {
  title: 'Patterns/Notification',
  component: Notification,
  tags: ['autodocs'],
  // onDismiss renders the close button, so it must not get an auto action arg
  parameters: { actions: { argTypesRegex: '^on(?!Dismiss)[A-Z].*' } },
  argTypes: { variant: { control: 'select', options: ['default', 'inverse'] }, layout: { control: 'select', options: ['desktop', 'mobile'] } },
  args: {
    title: "We've just released a new update!",
    description: 'Check out the all new dashboard view. Pages and exports now load faster.',
    actions: (
      <>
        <NotificationAction>Dismiss</NotificationAction>
        <NotificationAction>Changelog</NotificationAction>
      </>
    ),
  },
} satisfies Meta<typeof Notification>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = { args: { onDismiss: () => {} } };
export const Mobile: Story = { args: { layout: 'mobile', onDismiss: () => {} } };
export const Success: Story = { args: { icon: <CheckCircle className="h-icon-md w-icon-md" />, iconTone: 'success', title: 'Successfully updated profile' } };
export const Destructive: Story = { args: { icon: <FolderClosed className="h-icon-md w-icon-md" />, iconTone: 'destructive', title: 'This project has been unpublished' } };
export const WithAvatar: Story = { args: { avatar: <Avatar size="md"><AvatarFallback>EP</AvatarFallback></Avatar>, title: 'Emily Park', description: "I've finished adding my notes." } };
export const Progress: Story = {
  args: {
    icon: <UploadCloud className="h-icon-md w-icon-md" />,
    title: "Uploading 'website-FINAL06.fig'",
    description: 'Please wait while we upload your file.',
    progress: 60,
    progressLabel: '60% uploaded...',
    onDismiss: () => {},
  },
};
export const Snackbar: Story = {
  args: { variant: 'inverse', title: 'Task deleted', description: undefined, actions: <NotificationAction>Undo</NotificationAction>, onDismiss: () => {} },
};
