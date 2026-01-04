'use client';

import React from 'react';
import BaseModal from './BaseModal';
import KeyboardShortcut from './KeyboardShortcut';
import {Globe, Layers, Layout, ListTodo, Move} from 'lucide-react';
import {cn} from '@/lib/utils';

interface KeyboardShortcutsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const AltKey = isMac ? '⌥' : 'Alt';

const ShortcutRow: React.FC<{ label: string; keys: string[]; showModifier?: boolean; className?: string }> = ({
                                                                                                                  label,
                                                                                                                  keys,
                                                                                                                  showModifier = false,
                                                                                                                  className
                                                                                                              }) => (
    <div className={cn("flex items-center justify-between py-2 group", className)}>
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
        <KeyboardShortcut keys={keys} showModifier={showModifier}/>
    </div>);

const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({icon: Icon, title}) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
        <Icon className="w-4 h-4 text-primary"/>
        <h4 className="font-semibold text-sm text-foreground">{title}</h4>
    </div>);

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({open, onOpenChange}) => {
    return (<BaseModal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="Keyboard Shortcuts"
            description="Streamline your workflow with these hotkeys."
            className="max-w-3xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1">

                {/* Left Column: Navigation & View */}
                <div className="space-y-8">
                    <section>
                        <SectionHeader icon={Globe} title="Global Navigation"/>
                        <div className="space-y-1">
                            <ShortcutRow label="Shortcuts Menu" keys={[AltKey, "/"]}/>
                            <ShortcutRow label="User Profile" keys={[AltKey, "."]}/>
                            <ShortcutRow label="Settings" keys={[AltKey, ","]}/>
                        </div>
                    </section>

                    <section>
                        <SectionHeader icon={Layout} title="Interface Modes"/>
                        <div className="space-y-1">
                            <ShortcutRow label="Toggle Mode" keys={[AltKey, ";"]}/>
                            <ShortcutRow label="Toggle View" keys={[AltKey, "'"]}/>
                        </div>
                    </section>

                    <section>
                        <SectionHeader icon={Layers} title="Section Visibility"/>
                        <div className="space-y-1">
                            <ShortcutRow label="Toggle Me Section" keys={[AltKey, "1"]}/>
                            <ShortcutRow label="Toggle Actions Section" keys={[AltKey, "2"]}/>
                            <ShortcutRow label="Toggle Journal Section" keys={[AltKey, "3"]}/>
                        </div>
                    </section>
                </div>

                {/* Right Column: Item Actions */}
                <div className="space-y-8">
                    <section>
                        <SectionHeader icon={ListTodo} title="Item Actions"/>
                        <div className="space-y-1">
                            <ShortcutRow label="Complete Item" keys={["Enter"]}/>
                            <ShortcutRow label="Edit Text" keys={["Space"]}/>
                            <ShortcutRow label="Create New" keys={["Shift", "Enter"]}/>
                            <ShortcutRow label="Toggle Privacy" keys={["P"]}/>
                            <ShortcutRow label="Delete" keys={["Del"]}/>
                        </div>
                    </section>

                    <section>
                        <SectionHeader icon={Move} title="Organization"/>
                        <div className="space-y-1">
                            <ShortcutRow label="Indent (Nest)" keys={["Tab"]}/>
                            <ShortcutRow label="Outdent (Un-nest)" keys={["Shift", "Tab"]}/>
                            <ShortcutRow label="Move Item Up" keys={[AltKey, "↑"]}/>
                            <ShortcutRow label="Move Item Down" keys={[AltKey, "↓"]}/>
                        </div>
                    </section>
                </div>

            </div>
        </BaseModal>);
};

export default KeyboardShortcutsModal;
