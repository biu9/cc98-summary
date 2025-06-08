"use client"
import { Autocomplete, TextField } from "@mui/material";
import { useCallback, useState, useMemo } from "react";
import { GET } from "@/request";
import { debounce } from "@/utils/debounce";
import { API_ROOT } from "../../../../config";
import { ITopic } from "@cc98/api";
import { IReferenceProps } from "../types";

interface ReferenceProps {
  selectedTopics: IReferenceProps[];
  setSelectedTopics: React.Dispatch<React.SetStateAction<IReferenceProps[]>>;
  accessToken?: string;
}

const Reference: React.FC<ReferenceProps> = ({ selectedTopics, setSelectedTopics, accessToken }) => {
  const [reference, setReference] = useState<IReferenceProps[]>([]);
  const [composing, setComposing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const fetchOptions = useCallback(async (value: string) => {
    if (!value || !accessToken) return;
    const res: ITopic[] = await GET(`${API_ROOT}/topic/search?keyword=${value}&size=20&from=0&sf_request_type=fetch`, accessToken);
    setReference(res.map(item => {
      return {
        label: item.title,
        id: item.id,
        replyCount: item.replyCount
      }
    }));
  }, [accessToken]);

  const debouncedFetch = useMemo(() => debounce(fetchOptions, 500), [fetchOptions]);

  const handleInput = (event: React.SyntheticEvent, value: string) => {
    setInputValue(value);
    if (composing)
      return;
    debouncedFetch(value);
  }

  const onCompositionEnd = () => {
    setComposing(false);
    debouncedFetch(inputValue);
  }

  return (
    <Autocomplete
      multiple
      options={reference}
      value={selectedTopics}
      renderInput={(params) =>
        <TextField
          {...params}
          label="搜索和选择参考帖子（可多选）"
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: '#f8f9fa'
            }
          }}
        />
      }
      onInputChange={handleInput}
      className="w-full"
      onCompositionStart={() => setComposing(true)}
      onCompositionEnd={onCompositionEnd}
      onChange={(e, value) => {
        setSelectedTopics(value);
      }}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.id === value.id}
    />
  )
}

export default Reference; 