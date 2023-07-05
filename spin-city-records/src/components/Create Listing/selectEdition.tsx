import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { SelectItem } from '../../components/selectItem'
import type { ControllerRenderProps } from 'react-hook-form';
import type { Album } from './SearchAlbumsForm';

type SelectEditionProps = {
  editions: { id: number; type: string; }[],
  field: ControllerRenderProps<{
    price: number;
    currency: string;
    weight: string;
    format: string;
    description: string;
    condition: string;
    speed: string;
    album: Album;
    editions: {value: string}[];
    }, `editions.${number}.value`>
}

const SelectEdition = React.forwardRef<HTMLButtonElement, SelectEditionProps>(
  ({editions, field}, forwardedRef) => {

    return (
      <Select.Root onValueChange={field.onChange} name={field.name} value={field.value}>
        <Select.Trigger
          className="inline-flex  bg-black text-gray-300 items-center justify-center rounded-xl px-[15px] text-xl leading-none h-fit py-2 gap-[5px] outline-none"
          aria-label="Edition"
          ref={forwardedRef}
        >
          <Select.Value placeholder="Select Edition" />
          <Select.Icon className="text-custom-orange">
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="cursor-pointer overflow-hidden  bg-black text-gray-300 rounded-xl">
            <Select.Viewport className="p-[5px]">
              <Select.Group>
                {editions.map((e, i) => (
                  <SelectItem key={`Edition ${i}`} value={String(e.id)}>{e.type}</SelectItem>
                ))}
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    )
  }
)

SelectEdition.displayName= 'SelectEdition'

export default SelectEdition
// {editions.map((edition) => (
//   <label key={edition.id} className="flex items-center">
//     <input
//       type="checkbox"
//       name="edition"
//       value={edition.type}
//       onChange={(e) => {
//         const checked = e.target.checked;
//         setForm((prevForm) => {
//           const alreadySelected = prevForm.edition.find((ed) => ed.type === edition.type);
//           if (checked && !alreadySelected) {
//             // Add the checked edition
//             return { ...prevForm, edition: [...prevForm.edition, { type: edition.type }] };
//           } else if (!checked && alreadySelected) {
//             // Remove the unchecked edition
//             return { ...prevForm, edition: prevForm.edition.filter((ed) => ed.type !== edition.type) };
//           }
//           return prevForm;
//         });
//       }}
//       className="mr-2 rounded border-gray-300 focus:ring-primary-500 h-6 w-6"
//     />
//     <span>{edition.type}</span>
//   </label>
// ))}